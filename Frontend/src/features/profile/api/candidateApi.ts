import axios from "axios";

// Fallback to localhost if not configured
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

const AUTH_STORAGE_KEY = "joblink.auth.user";

function getStoredAuthUser(): { id?: string; role?: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as { id?: string; role?: string }) : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const authUser = getStoredAuthUser();
  if (authUser?.id) {
    config.headers["x-user-id"] = authUser.id;
  }
  if (authUser?.role) {
    config.headers["x-user-role"] = authUser.role;
  }

  return config;
});

export const getCandidateProfile = async () => {
  const response = await api.get("/user/profile");
  return response.data;
};

export const updateCandidateProfile = async (data: any) => {
  const response = await api.put("/user/profile", data);
  return response.data;
};

export const getCandidateResume = async () => {
  const response = await api.get("/user/resume");
  return response.data;
};

export const updateCandidateResume = async (data: any) => {
  const response = await api.put("/user/resume", data);
  return response.data;
};

export const getJobs = async (params?: Record<string, string | number | boolean | undefined>) => {
  const response = await api.get("/jobs", { params });
  return response.data;
};

export const getApplications = async () => {
  const response = await api.get("/user/applications");
  return response.data;
};

export const applyToJob = async (payload: { jobId: string; coverLetter?: string }) => {
  const response = await api.post("/user/applications", {
    jobId: payload.jobId,
    cover_letter: payload.coverLetter ?? "",
  });
  return response.data;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  const response = await api.patch(`/user/applications/${id}/status`, { status });
  return response.data;
};
