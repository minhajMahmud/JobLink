import axios from "axios";
import type {
  AdminAnalyticsResponse,
  AdminEmployerRecord,
  AdminQueryParams,
  AdminReportRecord,
  AdminUserRecord,
  ModerationJobRecord,
  ModerationPostRecord,
  PaginatedResponse,
  RbacMatrixResponse,
  SpamAlertRecord,
} from "@/modules/admin/types";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const toParams = (params?: AdminQueryParams) => ({
  page: params?.page ?? 1,
  limit: params?.limit ?? 10,
  query: params?.query,
  status: params?.status,
  role: params?.role,
  priority: params?.priority,
});

export const adminService = {
  async getUsers(params?: AdminQueryParams): Promise<PaginatedResponse<AdminUserRecord>> {
    const { data } = await api.get<PaginatedResponse<AdminUserRecord>>("/admin/users", { params: toParams(params) });
    return data;
  },

  async updateUserStatus(userId: string, status: string): Promise<{ user_id: string; status: string }> {
    const { data } = await api.patch<{ user_id: string; status: string }>(`/admin/users/${userId}/status`, { status });
    return data;
  },

  async deleteUser(userId: string): Promise<{ deleted: boolean; user_id: string }> {
    const { data } = await api.delete<{ deleted: boolean; user_id: string }>(`/admin/users/${userId}`);
    return data;
  },

  async getEmployers(params?: AdminQueryParams): Promise<PaginatedResponse<AdminEmployerRecord>> {
    const { data } = await api.get<PaginatedResponse<AdminEmployerRecord>>("/admin/employers", { params: toParams(params) });
    return data;
  },

  async verifyEmployer(employerId: string, isVerified: boolean): Promise<{ employer_id: string; is_verified: boolean }> {
    const { data } = await api.patch<{ employer_id: string; is_verified: boolean }>(`/admin/employers/${employerId}/verify`, {
      is_verified: isVerified,
    });
    return data;
  },

  async getPosts(params?: AdminQueryParams): Promise<PaginatedResponse<ModerationPostRecord>> {
    const { data } = await api.get<PaginatedResponse<ModerationPostRecord>>("/admin/posts", { params: toParams(params) });
    return data;
  },

  async moderatePost(postId: string, status: "Approved" | "Rejected" | "Removed", moderationNote?: string) {
    const { data } = await api.post(`/admin/posts/${postId}/moderate`, {
      status,
      moderation_note: moderationNote,
    });
    return data;
  },

  async getJobs(params?: AdminQueryParams): Promise<PaginatedResponse<ModerationJobRecord>> {
    const { data } = await api.get<PaginatedResponse<ModerationJobRecord>>("/admin/jobs", { params: toParams(params) });
    return data;
  },

  async moderateJob(jobId: string, status: "Approved" | "Rejected" | "Removed", moderationNote?: string) {
    const { data } = await api.post(`/admin/jobs/${jobId}/moderate`, {
      status,
      moderation_note: moderationNote,
    });
    return data;
  },

  async getAnalytics(range = "7d"): Promise<AdminAnalyticsResponse> {
    const { data } = await api.get<AdminAnalyticsResponse>("/admin/analytics", { params: { range } });
    return data;
  },

  async getReports(params?: AdminQueryParams): Promise<PaginatedResponse<AdminReportRecord>> {
    const { data } = await api.get<PaginatedResponse<AdminReportRecord>>("/admin/reports", { params: toParams(params) });
    return data;
  },

  async resolveReport(reportId: string, status: "Investigating" | "Resolved" | "Dismissed", adminNotes?: string) {
    const { data } = await api.post(`/admin/reports/${reportId}/resolve`, {
      status,
      admin_notes: adminNotes,
    });
    return data;
  },

  async getSpamAlerts(): Promise<{ alerts: SpamAlertRecord[] }> {
    const { data } = await api.get<{ alerts: SpamAlertRecord[] }>("/admin/spam-alerts");
    return data;
  },

  async getRbacMatrix(): Promise<RbacMatrixResponse> {
    const { data } = await api.get<RbacMatrixResponse>("/admin/rbac");
    return data;
  },
};
