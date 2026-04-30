import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginApi, registerApi, getMeApi, logoutApi } from "@/features/auth/api/authApi";

export type UserRole = "seeker" | "employer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  company?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string; role?: UserRole }) => Promise<{ success: boolean; message?: string }>;
  register: (payload: { email: string; password: string; firstName: string; lastName?: string; role?: UserRole }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Mock users — used as fallback when backend is unreachable
// ---------------------------------------------------------------------------
const mockUsers: Record<UserRole, AuthUser> = {
  seeker: {
    id: "seeker-1",
    name: "Alex Morgan",
    email: "seeker@nexus.demo",
    role: "seeker",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    company: "TechFlow Inc.",
  },
  employer: {
    id: "employer-1",
    name: "James Wilson",
    email: "employer@nexus.demo",
    role: "employer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    company: "CloudScale",
  },
  admin: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@nexus.demo",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
  },
};

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------
const AUTH_STORAGE_KEY = "joblink.auth.user";
const TOKEN_KEY = "token";

function loadStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null, token?: string): void {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());
  const [isLoading, setLoading] = useState(false);

  // On mount, if we have a stored token, re-validate it with /auth/me
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || user === null) return;

    getMeApi()
      .then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
          persistUser(res.user);
        }
      })
      .catch(() => {
        // Token invalid or backend down — keep stored user as-is
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (payload: { email: string; password: string; role?: UserRole }) => {
    setLoading(true);
    try {
      const res = await loginApi({ email: payload.email, password: payload.password });
      if (res.success && res.user && res.token) {
        persistUser(res.user, res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message ?? "Login failed" };
    } catch {
      // Backend unreachable — fall back to mock login by role
      if (payload.role && mockUsers[payload.role]) {
        const mockUser = mockUsers[payload.role];
        persistUser(mockUser);
        setUser(mockUser);
        return { success: true };
      }
      return { success: false, message: "Unable to connect to server" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
    role?: UserRole;
  }) => {
    setLoading(true);
    try {
      const res = await registerApi({
        email: payload.email,
        password: payload.password,
        first_name: payload.firstName,
        last_name: payload.lastName,
        role: payload.role,
      });
      if (res.success && res.user && res.token) {
        persistUser(res.user, res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message ?? "Registration failed" };
    } catch {
      return { success: false, message: "Unable to connect to server" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutApi().catch(() => { });
    persistUser(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, register, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
