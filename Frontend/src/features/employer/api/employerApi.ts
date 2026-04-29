import axios from "axios";

// Fallback to localhost if not configured
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const authUser = localStorage.getItem("auth_user");
  if (authUser) {
    try {
      const user = JSON.parse(authUser);
      if (user.id) config.headers["x-user-id"] = user.id;
      if (user.role) config.headers["x-user-role"] = user.role;
    } catch (e) {
      // Ignore parsing errors
    }
  }
  
  return config;
});

export const getCompanyProfile = async () => {
  const response = await api.get("/recruiter/employer/company");
  return response.data;
};

export const updateCompanyProfile = async (data: any) => {
  const response = await api.put("/recruiter/employer/company", data);
  return response.data;
};

export const getJobs = async () => {
  const response = await api.get("/recruiter/employer/jobs");
  return response.data;
};

export const createJob = async (data: any) => {
  const response = await api.post("/recruiter/employer/jobs", data);
  return response.data;
};

export const updateJobStatus = async (id: string, status: string) => {
  const response = await api.put(`/recruiter/employer/jobs/${id}/status`, { status });
  return response.data;
};

export const toggleJobFeatured = async (id: string) => {
  const response = await api.post(`/recruiter/employer/jobs/${id}/toggle-featured`);
  return response.data;
};

export const deleteJob = async (id: string) => {
  const response = await api.delete(`/recruiter/employer/jobs/${id}`);
  return response.data;
};

export const getApplicants = async () => {
  const response = await api.get("/recruiter/employer/applicants");
  return response.data;
};

export const updateApplicantStatus = async (id: string, status: string) => {
  const response = await api.put(`/recruiter/employer/applicants/${id}/status`, { status });
  return response.data;
};

export const updateApplicantNotes = async (id: string, notes: string) => {
  const response = await api.put(`/recruiter/employer/applicants/${id}/notes`, { notes });
  return response.data;
};

export const getInterviews = async () => {
  const response = await api.get("/recruiter/employer/interviews");
  return response.data;
};

export const scheduleInterview = async (data: any) => {
  const response = await api.post("/recruiter/employer/interviews", data);
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get("/recruiter/employer/posts");
  return response.data;
};

export const createPost = async (data: any) => {
  const response = await api.post("/recruiter/employer/posts", data);
  return response.data;
};
