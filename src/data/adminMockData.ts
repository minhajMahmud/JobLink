export type UserStatus = "active" | "suspended" | "pending";
export type UserRoleType = "seeker" | "employer" | "admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  status: UserStatus;
  joinedAt: string;
  lastActive: string;
  avatar: string;
  flagsCount: number;
}

export interface AdminEmployer {
  id: string;
  company: string;
  contact: string;
  email: string;
  industry: string;
  verified: boolean;
  activeJobs: number;
  joinedAt: string;
  logo: string;
}

export interface AdminPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  postedAt: string;
  reports: number;
  status: "active" | "flagged" | "removed";
  spamScore: number;
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  applicants: number;
  status: "active" | "flagged" | "removed";
  reports: number;
}

export interface AdminReport {
  id: string;
  type: "post" | "job" | "user" | "comment";
  targetTitle: string;
  reportedBy: string;
  reason: string;
  reportedAt: string;
  status: "open" | "investigating" | "resolved";
  priority: "low" | "medium" | "high";
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  ipAddress: string;
  category: "auth" | "moderation" | "user" | "system";
}

export interface RolePermission {
  role: UserRoleType;
  permissions: { name: string; allowed: boolean }[];
}

export const adminUsers: AdminUser[] = [
  {
    id: "u-1",
    name: "Alex Morgan",
    email: "alex.morgan@nexus.demo",
    role: "seeker",
    status: "active",
    joinedAt: "2024-08-12",
    lastActive: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    flagsCount: 0,
  },
  {
    id: "u-2",
    name: "James Wilson",
    email: "james@cloudscale.io",
    role: "employer",
    status: "active",
    joinedAt: "2024-05-22",
    lastActive: "1 day ago",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    flagsCount: 0,
  },
  {
    id: "u-3",
    name: "Priya Sharma",
    email: "priya.s@designhub.co",
    role: "seeker",
    status: "pending",
    joinedAt: "2025-04-10",
    lastActive: "5 minutes ago",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    flagsCount: 1,
  },
  {
    id: "u-4",
    name: "Marcus Lee",
    email: "marcus.lee@spam.example",
    role: "seeker",
    status: "suspended",
    joinedAt: "2025-03-04",
    lastActive: "12 days ago",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    flagsCount: 8,
  },
  {
    id: "u-5",
    name: "Sofia Reyes",
    email: "sofia@brightlabs.co",
    role: "employer",
    status: "active",
    joinedAt: "2024-11-30",
    lastActive: "3 hours ago",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    flagsCount: 0,
  },
  {
    id: "u-6",
    name: "Daniel Kim",
    email: "daniel.kim@nexus.demo",
    role: "seeker",
    status: "active",
    joinedAt: "2025-01-15",
    lastActive: "Just now",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face",
    flagsCount: 0,
  },
];

export const adminEmployers: AdminEmployer[] = [
  {
    id: "e-1",
    company: "CloudScale",
    contact: "James Wilson",
    email: "james@cloudscale.io",
    industry: "SaaS",
    verified: true,
    activeJobs: 12,
    joinedAt: "2024-05-22",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=100&h=100&fit=crop",
  },
  {
    id: "e-2",
    company: "BrightLabs",
    contact: "Sofia Reyes",
    email: "sofia@brightlabs.co",
    industry: "AI Research",
    verified: true,
    activeJobs: 5,
    joinedAt: "2024-11-30",
    logo: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop",
  },
  {
    id: "e-3",
    company: "PixelForge Studio",
    contact: "Hana Tanaka",
    email: "hana@pixelforge.studio",
    industry: "Design",
    verified: false,
    activeJobs: 3,
    joinedAt: "2025-04-02",
    logo: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop",
  },
  {
    id: "e-4",
    company: "Quantum Finance",
    contact: "Robert Cole",
    email: "rcole@quantumfin.com",
    industry: "Fintech",
    verified: false,
    activeJobs: 8,
    joinedAt: "2025-03-18",
    logo: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop",
  },
];

export const adminPosts: AdminPost[] = [
  {
    id: "p-1",
    author: "Alex Morgan",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "Just shipped a new design system for our team — sharing learnings on tokens & theming next week.",
    postedAt: "2 hours ago",
    reports: 0,
    status: "active",
    spamScore: 4,
  },
  {
    id: "p-2",
    author: "Marcus Lee",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    content: "🔥🔥 BUY FOLLOWERS NOW!! Click my profile link → 100% guaranteed growth!! 🔥🔥",
    postedAt: "1 day ago",
    reports: 12,
    status: "flagged",
    spamScore: 96,
  },
  {
    id: "p-3",
    author: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "Looking for collaborators on an open-source accessibility toolkit. DM if interested!",
    postedAt: "5 hours ago",
    reports: 0,
    status: "active",
    spamScore: 6,
  },
  {
    id: "p-4",
    author: "Anonymous User",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
    content: "Inappropriate content removed by moderator team after 4 user reports.",
    postedAt: "3 days ago",
    reports: 4,
    status: "removed",
    spamScore: 78,
  },
  {
    id: "p-5",
    author: "Daniel Kim",
    authorAvatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face",
    content: "Hiring tip: structured interviews reduce bias by 40%. Here's our team's question template ↓",
    postedAt: "6 hours ago",
    reports: 0,
    status: "active",
    spamScore: 2,
  },
];

export const adminJobs: AdminJob[] = [
  {
    id: "j-1",
    title: "Senior Product Designer",
    company: "CloudScale",
    location: "Remote",
    postedAt: "2 days ago",
    applicants: 48,
    status: "active",
    reports: 0,
  },
  {
    id: "j-2",
    title: "Earn $5000/week from home — no skills needed!",
    company: "Quantum Finance",
    location: "Anywhere",
    postedAt: "1 day ago",
    applicants: 3,
    status: "flagged",
    reports: 9,
  },
  {
    id: "j-3",
    title: "Frontend Engineer (React + TS)",
    company: "BrightLabs",
    location: "San Francisco",
    postedAt: "5 hours ago",
    applicants: 21,
    status: "active",
    reports: 0,
  },
  {
    id: "j-4",
    title: "Marketing Intern (unpaid, 60h/week)",
    company: "PixelForge Studio",
    location: "Tokyo",
    postedAt: "4 days ago",
    applicants: 1,
    status: "flagged",
    reports: 5,
  },
];

export const adminReports: AdminReport[] = [
  {
    id: "r-1",
    type: "post",
    targetTitle: "Spam: BUY FOLLOWERS NOW",
    reportedBy: "12 users",
    reason: "Spam / promotional content",
    reportedAt: "1 day ago",
    status: "investigating",
    priority: "high",
  },
  {
    id: "r-2",
    type: "job",
    targetTitle: "Earn $5000/week from home",
    reportedBy: "9 users",
    reason: "Suspicious / scam listing",
    reportedAt: "1 day ago",
    status: "open",
    priority: "high",
  },
  {
    id: "r-3",
    type: "user",
    targetTitle: "Marcus Lee",
    reportedBy: "Sofia Reyes",
    reason: "Repeated harassment in DMs",
    reportedAt: "2 days ago",
    status: "open",
    priority: "high",
  },
  {
    id: "r-4",
    type: "job",
    targetTitle: "Marketing Intern (unpaid, 60h/week)",
    reportedBy: "5 users",
    reason: "Labor policy violation",
    reportedAt: "3 days ago",
    status: "investigating",
    priority: "medium",
  },
  {
    id: "r-5",
    type: "comment",
    targetTitle: "Comment on 'Hiring tip' thread",
    reportedBy: "Daniel Kim",
    reason: "Hate speech",
    reportedAt: "5 days ago",
    status: "resolved",
    priority: "medium",
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: "a-1",
    actor: "admin@nexus.demo",
    action: "Suspended user account",
    target: "marcus.lee@spam.example",
    timestamp: "2025-04-18 14:22 UTC",
    ipAddress: "192.168.1.42",
    category: "moderation",
  },
  {
    id: "a-2",
    actor: "admin@nexus.demo",
    action: "Removed flagged job post",
    target: "Earn $5000/week from home",
    timestamp: "2025-04-18 13:50 UTC",
    ipAddress: "192.168.1.42",
    category: "moderation",
  },
  {
    id: "a-3",
    actor: "system",
    action: "Auto-flagged post (spam score 96)",
    target: "Post p-2 by Marcus Lee",
    timestamp: "2025-04-18 09:14 UTC",
    ipAddress: "—",
    category: "system",
  },
  {
    id: "a-4",
    actor: "admin@nexus.demo",
    action: "Verified employer",
    target: "BrightLabs",
    timestamp: "2025-04-17 18:02 UTC",
    ipAddress: "192.168.1.42",
    category: "user",
  },
  {
    id: "a-5",
    actor: "admin@nexus.demo",
    action: "Updated role permissions",
    target: "employer role — added 'feature_jobs'",
    timestamp: "2025-04-17 11:30 UTC",
    ipAddress: "192.168.1.42",
    category: "system",
  },
  {
    id: "a-6",
    actor: "admin@nexus.demo",
    action: "Login successful",
    target: "Admin panel",
    timestamp: "2025-04-17 09:00 UTC",
    ipAddress: "192.168.1.42",
    category: "auth",
  },
  {
    id: "a-7",
    actor: "system",
    action: "Failed login attempts (3) — IP rate-limited",
    target: "203.0.113.55",
    timestamp: "2025-04-16 22:11 UTC",
    ipAddress: "203.0.113.55",
    category: "auth",
  },
];

export const rolePermissions: RolePermission[] = [
  {
    role: "seeker",
    permissions: [
      { name: "View jobs", allowed: true },
      { name: "Apply to jobs", allowed: true },
      { name: "Post in feed", allowed: true },
      { name: "Send messages", allowed: true },
      { name: "Post jobs", allowed: false },
      { name: "Moderate content", allowed: false },
    ],
  },
  {
    role: "employer",
    permissions: [
      { name: "View jobs", allowed: true },
      { name: "Post jobs", allowed: true },
      { name: "View applicants", allowed: true },
      { name: "Feature jobs", allowed: true },
      { name: "Send messages", allowed: true },
      { name: "Moderate content", allowed: false },
    ],
  },
  {
    role: "admin",
    permissions: [
      { name: "Full platform access", allowed: true },
      { name: "Moderate content", allowed: true },
      { name: "Manage users", allowed: true },
      { name: "Manage employers", allowed: true },
      { name: "View audit logs", allowed: true },
      { name: "Edit role permissions", allowed: true },
    ],
  },
];

export const platformGrowth = [
  { month: "Nov", users: 6200, employers: 180, jobs: 320 },
  { month: "Dec", users: 7400, employers: 215, jobs: 410 },
  { month: "Jan", users: 8650, employers: 248, jobs: 502 },
  { month: "Feb", users: 9800, employers: 281, jobs: 560 },
  { month: "Mar", users: 11200, employers: 322, jobs: 624 },
  { month: "Apr", users: 12480, employers: 358, jobs: 684 },
];

export const moderationTrend = [
  { day: "Mon", flagged: 12, resolved: 9 },
  { day: "Tue", flagged: 18, resolved: 14 },
  { day: "Wed", flagged: 9, resolved: 11 },
  { day: "Thu", flagged: 22, resolved: 17 },
  { day: "Fri", flagged: 15, resolved: 19 },
  { day: "Sat", flagged: 7, resolved: 8 },
  { day: "Sun", flagged: 5, resolved: 6 },
];

export const userRoleBreakdown = [
  { name: "Job Seekers", value: 11420 },
  { name: "Employers", value: 358 },
  { name: "Admins", value: 12 },
];
