import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Award,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  Eye,
  Flag,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/features/auth/context/AuthContext";

export type NotificationCategory =
  | "report"
  | "spam"
  | "verification"
  | "moderation"
  | "system"
  | "application"
  | "interview"
  | "message"
  | "connection"
  | "profile"
  | "job"
  | "applicant";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string;
  read: boolean;
  priority?: "high" | "medium" | "low";
  href?: string;
}

export interface NotificationPreference {
  category: NotificationCategory;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationPreferences {
  [key: string]: NotificationPreference;
}

export const categoryMeta: Record<NotificationCategory, { icon: LucideIcon; tone: string; label: string }> = {
  report: { icon: Flag, tone: "bg-destructive/10 text-destructive", label: "Report" },
  spam: { icon: ShieldAlert, tone: "bg-destructive/10 text-destructive", label: "Spam" },
  verification: { icon: BadgeCheck, tone: "bg-amber-500/10 text-amber-600", label: "Verification" },
  moderation: { icon: AlertTriangle, tone: "bg-amber-500/10 text-amber-600", label: "Moderation" },
  system: { icon: Sparkles, tone: "bg-primary/10 text-primary", label: "System" },
  application: { icon: Briefcase, tone: "bg-primary/10 text-primary", label: "Application" },
  interview: { icon: CalendarClock, tone: "bg-emerald-500/10 text-emerald-600", label: "Interview" },
  message: { icon: MessageSquare, tone: "bg-blue-500/10 text-blue-600", label: "Message" },
  connection: { icon: UserPlus, tone: "bg-emerald-500/10 text-emerald-600", label: "Network" },
  profile: { icon: Eye, tone: "bg-secondary text-foreground", label: "Profile" },
  job: { icon: Award, tone: "bg-primary/10 text-primary", label: "Job" },
  applicant: { icon: Users, tone: "bg-primary/10 text-primary", label: "Applicant" },
};

const seekerSeed: AppNotification[] = [
  {
    id: "ns-1",
    category: "application",
    title: "Application moved to interview stage",
    description: "CloudScale advanced your application for Senior Product Designer.",
    time: "12 minutes ago",
    read: false,
    href: "/jobs",
  },
  {
    id: "ns-2",
    category: "interview",
    title: "Interview scheduled — Thursday at 3:00 PM",
    description: "Video interview with the BrightLabs hiring team.",
    time: "1 hour ago",
    read: false,
    href: "/messages",
  },
  {
    id: "ns-3",
    category: "profile",
    title: "Your profile was viewed by 8 recruiters today",
    description: "Quantum Finance, BrightLabs, and 6 others viewed your profile.",
    time: "3 hours ago",
    read: false,
    href: "/profile",
  },
  {
    id: "ns-4",
    category: "connection",
    title: "Sofia Reyes wants to connect",
    description: "Head of Talent at BrightLabs sent you a connection request.",
    time: "Yesterday",
    read: true,
    href: "/network",
  },
  {
    id: "ns-5",
    category: "message",
    title: "New message from James Wilson",
    description: "“Hey Alex — would love to chat about a senior design role.”",
    time: "Yesterday",
    read: true,    href: "/messages",  },
];

const employerSeed: AppNotification[] = [
  {
    id: "ne-1",
    category: "applicant",
    title: "5 new applicants for Senior Product Designer",
    description: "Top match: Alex Morgan (94% skill match).",
    time: "8 minutes ago",
    read: false,
    priority: "high",
    href: "/jobs",
  },
  {
    id: "ne-2",
    category: "interview",
    title: "Interview reminder — Daniel Kim at 2:00 PM",
    description: "Video call scheduled for the Frontend Engineer role.",
    time: "30 minutes ago",
    read: false,
    href: "/messages",
  },
  {
    id: "ne-3",
    category: "job",
    title: "Featured job promotion ending soon",
    description: "Your Senior Product Designer post leaves the featured slot in 2 days.",
    time: "2 hours ago",
    read: false,
    priority: "medium",
    href: "/jobs",
  },
  {
    id: "ne-4",
    category: "message",
    title: "Candidate replied to your outreach",
    description: "Priya Sharma responded to your message about the design role.",
    time: "Yesterday",
    read: true,
    href: "/messages",
  },
  {
    id: "ne-5",
    category: "system",
    title: "Hiring analytics report ready",
    description: "Your weekly hiring funnel report is now available.",
    time: "Yesterday",
    read: true,
    href: "/employer/dashboard",
  },
];

const adminSeed: AppNotification[] = [
  {
    id: "na-1",
    category: "spam",
    title: "Spam detected — auto-flagged post",
    description: "AI flagged a post by Marcus Lee with spam score 96/100.",
    time: "5 minutes ago",
    read: false,
    priority: "high",
    href: "/admin/dashboard",
  },
  {
    id: "na-2",
    category: "report",
    title: "New high-priority report",
    description: "12 users reported the post “BUY FOLLOWERS NOW”.",
    time: "20 minutes ago",
    read: false,
    priority: "high",    href: "/admin/dashboard",  },
  {
    id: "na-3",
    category: "verification",
    title: "2 employer verifications pending",
    description: "PixelForge Studio and Quantum Finance are awaiting review.",
    time: "1 hour ago",
    read: false,
    priority: "medium",
    href: "/admin/dashboard",
  },
  {
    id: "na-4",
    category: "report",
    title: "Job listing reported as scam",
    description: "“Earn $5000/week from home” received 9 user reports.",
    time: "2 hours ago",
    read: false,
    priority: "high",    href: "/admin/dashboard",  },
  {
    id: "na-5",
    category: "moderation",
    title: "Comment flagged for hate speech",
    description: "Reported by Daniel Kim on the “Hiring tip” thread.",
    time: "Yesterday",
    read: true,    href: "/admin/dashboard",  },
  {
    id: "na-6",
    category: "system",
    title: "Failed login spike detected",
    description: "3 failed attempts from IP 203.0.113.55 — auto rate-limited.",
    time: "Yesterday",
    read: true,
    href: "/admin/dashboard",
  },
];

const seedByRole: Record<UserRole, AppNotification[]> = {
  seeker: seekerSeed,
  employer: employerSeed,
  admin: adminSeed,
};

const defaultPreferences: Record<NotificationCategory, NotificationPreference> = {
  report: { category: "report", email: true, push: true, inApp: true },
  spam: { category: "spam", email: true, push: false, inApp: true },
  verification: { category: "verification", email: true, push: true, inApp: true },
  moderation: { category: "moderation", email: true, push: false, inApp: true },
  system: { category: "system", email: false, push: false, inApp: true },
  application: { category: "application", email: true, push: true, inApp: true },
  interview: { category: "interview", email: true, push: true, inApp: true },
  message: { category: "message", email: true, push: true, inApp: true },
  connection: { category: "connection", email: true, push: true, inApp: true },
  profile: { category: "profile", email: false, push: false, inApp: true },
  job: { category: "job", email: true, push: true, inApp: true },
  applicant: { category: "applicant", email: true, push: true, inApp: true },
};

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  preferences: Record<NotificationCategory, NotificationPreference>;
  updatePreference: (category: NotificationCategory, deliveryMethod: "email" | "push" | "inApp", enabled: boolean) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ role, children }: { role: UserRole; children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(seedByRole[role]);
  const [preferences, setPreferences] = useState<Record<NotificationCategory, NotificationPreference>>(() => {
    const stored = localStorage.getItem(`notification-prefs-${role}`);
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const updatePreference = useCallback(
    (category: NotificationCategory, deliveryMethod: "email" | "push" | "inApp", enabled: boolean) => {
      setPreferences((prev) => {
        const updated = {
          ...prev,
          [category]: { ...prev[category], [deliveryMethod]: enabled },
        };
        localStorage.setItem(`notification-prefs-${role}`, JSON.stringify(updated));
        return updated;
      });
    },
    [role],
  );

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      markAsRead,
      markAllAsRead,
      clearAll,
      preferences,
      updatePreference,
    }),
    [notifications, markAsRead, markAllAsRead, clearAll, preferences, updatePreference],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}
