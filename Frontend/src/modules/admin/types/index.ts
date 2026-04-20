export type AdminUserRole = "admin" | "recruiter" | "candidate";

export type AdminStatus = "Active" | "Suspended" | "Banned" | "Pending";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminStatus;
  joined_at: string;
}

export interface AdminEmployerRecord {
  id: string;
  company_name: string;
  email: string;
  is_verified: boolean;
  status: AdminStatus;
  jobs_posted: number;
}

export interface ModerationPostRecord {
  id: string;
  author_name: string;
  content: string;
  status: "Pending" | "Approved" | "Rejected" | "Removed";
  spam_score: number;
  flagged_keywords: string[];
}

export interface ModerationJobRecord {
  id: string;
  title: string;
  company_name: string;
  status: "Pending" | "Approved" | "Rejected" | "Removed";
  spam_score: number;
}

export interface AdminReportRecord {
  id: string;
  category: "spam" | "abuse" | "fake_job" | "harassment" | "other";
  entity_type: "post" | "job" | "user" | "comment";
  entity_id: string;
  details: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "Investigating" | "Resolved" | "Dismissed";
}

export interface AdminAnalyticsResponse {
  range: string;
  kpis: {
    total_users: number;
    total_employers: number;
    total_jobs: number;
    daily_active_users: number;
    monthly_active_users: number;
    revenue: number;
  };
  application_trends: Array<{ label: string; value: number }>;
  user_growth: Array<{ label: string; users: number; employers: number; jobs: number }>;
}

export interface SpamAlertRecord {
  entity_type: "post" | "job" | "user";
  entity_id: string;
  score: number;
  risk_level: "Low" | "Medium" | "High";
  reasons: string[];
}

export interface RbacMatrixResponse {
  roles: string[];
  permissions: string[];
  matrix: Record<string, string[]>;
}

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  query?: string;
  status?: string;
  role?: string;
  priority?: string;
}
