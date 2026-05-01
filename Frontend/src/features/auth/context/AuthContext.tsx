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
// Storage helpers
// ---------------------------------------------------------------------------
const AUTH_STORAGE_KEY = "joblink.auth.user";
const TOKEN_KEY = "token";

function isValidUUID(id: string): boolean {
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

function loadStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.role) return null;

    // Validate that user ID is a proper UUID (not a mock ID like "seeker-1")
    if (!isValidUUID(parsed.id)) {
      console.warn("⚠️ Invalid user ID format in localStorage. Clearing stored user.");
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

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
        // Validate user ID is a proper UUID before storing
        if (!isValidUUID(res.user.id)) {
          console.error("❌ Backend returned invalid user ID format:", res.user.id);
          return { success: false, message: "Invalid user data from server" };
        }
        persistUser(res.user, res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message ?? "Login failed" };
    } catch {
      // ❌ NO MOCK USER FALLBACK - Backend must be running
      return { success: false, message: "Unable to connect to server. Please ensure backend is running." };
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
        // Validate user ID is a proper UUID before storing
        if (!isValidUUID(res.user.id)) {
          console.error("❌ Backend returned invalid user ID format:", res.user.id);
          return { success: false, message: "Invalid user data from server" };
        }
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
