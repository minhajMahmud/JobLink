import axios, { AxiosInstance } from "axios";
import type {
  Interview,
  InterviewScheduleRequest,
  RecruiterAvailability,
  TimeSlot,
} from "@/modules/recruiter/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class InterviewSchedulingService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/recruiter/interviews`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Schedule a new interview
   */
  async scheduleInterview(data: InterviewScheduleRequest): Promise<Interview> {
    const response = await this.api.post<Interview>("/schedule", data);
    return response.data;
  }

  /**
   * Get interview by ID
   */
  async getInterview(interviewId: string): Promise<Interview> {
    const response = await this.api.get<Interview>(`/${interviewId}`);
    return response.data;
  }

  /**
   * List interviews for recruiter with filters
   */
  async getMyInterviews(
    status?: string,
    from_date?: string,
    to_date?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<Interview[]> {
    const response = await this.api.get<Interview[]>("/my-interviews", {
      params: { status, from_date, to_date, page, limit },
    });
    return response.data;
  }

  /**
   * Get candidate's interviews
   */
  async getCandidateInterviews(candidateId: string): Promise<Interview[]> {
    const response = await this.api.get<Interview[]>(`/candidate/${candidateId}`);
    return response.data;
  }

  /**
   * Get job's interviews
   */
  async getJobInterviews(jobId: string): Promise<Interview[]> {
    const response = await this.api.get<Interview[]>(`/job/${jobId}`);
    return response.data;
  }

  /**
   * Update interview (reschedule, add notes, etc.)
   */
  async updateInterview(interviewId: string, updates: Partial<Interview>): Promise<Interview> {
    const response = await this.api.put<Interview>(`/${interviewId}`, updates);
    return response.data;
  }

  /**
   * Cancel interview
   */
  async cancelInterview(interviewId: string, reason?: string): Promise<void> {
    await this.api.post(`/${interviewId}/cancel`, { reason });
  }

  /**
   * Mark interview as completed
   */
  async completeInterview(
    interviewId: string,
    notes: string,
    rating?: number,
  ): Promise<Interview> {
    const response = await this.api.post<Interview>(`/${interviewId}/complete`, {
      notes,
      rating,
    });
    return response.data;
  }

  /**
   * Reschedule interview
   */
  async rescheduleInterview(
    interviewId: string,
    newScheduledAt: string,
    reason?: string,
  ): Promise<Interview> {
    const response = await this.api.post<Interview>(`/${interviewId}/reschedule`, {
      scheduled_at: newScheduledAt,
      reason,
    });
    return response.data;
  }

  /**
   * Get recruiter availability for a date range
   */
  async getAvailability(
    from_date: string,
    to_date: string,
  ): Promise<RecruiterAvailability[]> {
    const response = await this.api.get<RecruiterAvailability[]>("/availability", {
      params: { from_date, to_date },
    });
    return response.data;
  }

  /**
   * Set recruiter availability slots
   */
  async setAvailability(
    date: string,
    slots: Array<{ start_time: string; end_time: string }>,
  ): Promise<void> {
    await this.api.post("/availability", { date, slots });
  }

  /**
   * Get available time slots for scheduling
   */
  async getAvailableSlots(
    date: string,
    duration_minutes: number = 30,
  ): Promise<TimeSlot[]> {
    const response = await this.api.get<TimeSlot[]>("/available-slots", {
      params: { date, duration: duration_minutes },
    });
    return response.data;
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflict(
    recruiterId: string,
    start_time: string,
    end_time: string,
  ): Promise<{ has_conflict: boolean; conflict_with?: Interview }> {
    const response = await this.api.get<{
      has_conflict: boolean;
      conflict_with?: Interview;
    }>("/check-conflict", {
      params: { recruiter_id: recruiterId, start_time, end_time },
    });
    return response.data;
  }

  /**
   * Generate video meeting link (Zoom/Google Meet integration)
   */
  async generateMeetingLink(type: "zoom" | "google_meet"): Promise<{ link: string }> {
    const response = await this.api.post<{ link: string }>("/generate-meeting-link", { type });
    return response.data;
  }

  /**
   * Send interview invitation to candidate
   */
  async sendInvitation(interviewId: string, customMessage?: string): Promise<void> {
    await this.api.post(`/${interviewId}/send-invitation`, { custom_message: customMessage });
  }

  /**
   * Get interview statistics for recruiter
   */
  async getInterviewStats(
    from_date?: string,
    to_date?: string,
  ): Promise<{
    total_interviews: number;
    completed: number;
    pending: number;
    cancelled: number;
    avg_duration: number;
  }> {
    const response = await this.api.get<{
      total_interviews: number;
      completed: number;
      pending: number;
      cancelled: number;
      avg_duration: number;
    }>("/stats", { params: { from_date, to_date } });
    return response.data;
  }
}

export const interviewSchedulingService = new InterviewSchedulingService();
