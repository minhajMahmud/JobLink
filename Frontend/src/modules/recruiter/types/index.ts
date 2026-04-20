// Candidate/User Types
export interface Candidate {
  id: string;
  user_id: string;
  skills: string[];
  experience_years: number;
  education_level: "High School" | "Bachelor" | "Master" | "PhD";
  location: string;
  availability_status: "Available" | "Actively Looking" | "Open to Opportunities" | "Not Available";
  salary_expectation_min: number;
  salary_expectation_max: number;
  bio: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateFilter {
  skills?: string[];
  experience_min?: number;
  experience_max?: number;
  education_level?: string[];
  location?: string;
  availability_status?: string;
  salary_min?: number;
  salary_max?: number;
  search_query?: string;
  sort_by?: "relevance" | "recently_active" | "experience";
  page?: number;
  limit?: number;
}

export interface CandidateSearchResult {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  filters_applied: CandidateFilter;
}

export interface SavedCandidateSearch {
  id: string;
  recruiter_id: string;
  name: string;
  filters: CandidateFilter;
  created_at: string;
}

// Interview Types
export type InterviewType = "Virtual" | "In-Person" | "Phone" | "Technical";
export type InterviewStatus = "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";
export type InterviewRound = "Screening" | "Technical" | "HR" | "Final";

export interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  recruiter_id: string;
  type: InterviewType;
  round: InterviewRound;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  location?: string; // For in-person
  meet_link?: string; // For virtual
  agenda?: string;
  notes?: string;
  status: InterviewStatus;
  created_at: string;
  updated_at: string;
}

export interface InterviewScheduleRequest {
  candidate_id: string;
  job_id: string;
  type: InterviewType;
  round: InterviewRound;
  scheduled_at: string;
  duration_minutes: number;
  timezone: string;
  location?: string;
  agenda?: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface RecruiterAvailability {
  recruiter_id: string;
  date: string;
  slots: TimeSlot[];
}

// Job Types
export interface Job {
  id: string;
  recruiter_id: string;
  company_id: string;
  title: string;
  description: string;
  requirements: string[];
  salary_min: number;
  salary_max: number;
  location: string;
  job_type: "Full-time" | "Part-time" | "Contract";
  status: "Draft" | "Published" | "Closed";
  created_at: string;
  updated_at: string;
}

export interface JobPromotion {
  id: string;
  job_id: string;
  recruiter_id: string;
  duration_days: 7 | 15 | 30;
  start_date: string;
  end_date: string;
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  price?: number;
  status: "Pending" | "Active" | "Expired" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface JobPromotionStats {
  views: number;
  clicks: number;
  applications: number;
  conversion_rate: number;
  roi?: number;
}

// Post/Engagement Types
export type PostType = "Text" | "Image" | "Video" | "Link";

export interface CompanyPost {
  id: string;
  recruiter_id: string;
  company_id: string;
  content: string;
  media?: {
    type: PostType;
    url: string;
  }[];
  engagement_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PostEngagement {
  id: string;
  post_id: string;
  user_id: string;
  type: "Like" | "Comment" | "Share";
  content?: string; // For comments
  created_at: string;
}

export interface PostFeed {
  posts: CompanyPost[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard Analytics
export interface RecruiterDashboard {
  open_jobs_count: number;
  total_applications: number;
  scheduled_interviews: number;
  featured_jobs: JobPromotion[];
  recent_posts: CompanyPost[];
  pipeline_stats: {
    screening: number;
    technical: number;
    hr: number;
    final: number;
  };
}

// Filter Presets
export interface FilterPreset {
  id: string;
  recruiter_id: string;
  name: string;
  filters: CandidateFilter;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
