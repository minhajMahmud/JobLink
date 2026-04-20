import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  login: (payload: { email: string; password: string; role: UserRole }) => void;
  logout: () => void;
}

const roleUsers: Record<UserRole, AuthUser> = {
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = "joblink.auth.user";

function loadStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.role || !(parsed.role in roleUsers)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => loadStoredUser());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: ({ role }) => {
        setUser(roleUsers[role]);
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
