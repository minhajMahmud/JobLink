import axios, { AxiosInstance } from "axios";
import type {
  Candidate,
  CandidateFilter,
  CandidateSearchResult,
  SavedCandidateSearch,
  PaginatedResponse,
} from "@/modules/recruiter/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class CandidateSearchService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/recruiter/candidates`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token from localStorage if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Search candidates with advanced filters
   */
  async searchCandidates(filters: CandidateFilter): Promise<CandidateSearchResult> {
    const params = this.buildQueryParams(filters);
    const response = await this.api.get<CandidateSearchResult>("/search", { params });
    return response.data;
  }

  /**
   * Get single candidate profile
   */
  async getCandidateProfile(candidateId: string): Promise<Candidate> {
    const response = await this.api.get<Candidate>(`/${candidateId}`);
    return response.data;
  }

  /**
   * Get candidates by IDs (batch)
   */
  async getCandidatesBatch(candidateIds: string[]): Promise<Candidate[]> {
    const response = await this.api.post<Candidate[]>("/batch", { ids: candidateIds });
    return response.data;
  }

  /**
   * Save a candidate search preset
   */
  async saveCandidateSearch(
    name: string,
    filters: CandidateFilter,
  ): Promise<SavedCandidateSearch> {
    const response = await this.api.post<SavedCandidateSearch>("/saved-searches", {
      name,
      filters,
    });
    return response.data;
  }

  /**
   * Get saved candidate searches
   */
  async getSavedSearches(): Promise<SavedCandidateSearch[]> {
    const response = await this.api.get<SavedCandidateSearch[]>("/saved-searches");
    return response.data;
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(searchId: string): Promise<void> {
    await this.api.delete(`/saved-searches/${searchId}`);
  }

  /**
   * Load and apply a saved search
   */
  async loadSavedSearch(searchId: string): Promise<CandidateSearchResult> {
    const response = await this.api.get<CandidateSearchResult>(
      `/saved-searches/${searchId}/apply`,
    );
    return response.data;
  }

  /**
   * Get trending skills for suggestions
   */
  async getTrendingSkills(limit: number = 20): Promise<string[]> {
    const response = await this.api.get<string[]>("/trending-skills", { params: { limit } });
    return response.data;
  }

  /**
   * Get candidate match score
   */
  async getCandidateMatchScore(candidateId: string, jobId: string): Promise<number> {
    const response = await this.api.get<{ score: number }>(
      `/${candidateId}/match-score/${jobId}`,
    );
    return response.data.score;
  }

  /**
   * Get candidates for specific job (ranked by match)
   */
  async getCandidatesForJob(
    jobId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<Candidate>> {
    const response = await this.api.get<PaginatedResponse<Candidate>>(`/jobs/${jobId}/candidates`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get candidate skills with proficiency
   */
  async getCandidateSkills(candidateId: string): Promise<{ skill: string; level: string }[]> {
    const response = await this.api.get<{ skill: string; level: string }[]>(
      `/${candidateId}/skills`,
    );
    return response.data;
  }

  private buildQueryParams(filters: CandidateFilter): Record<string, any> {
    const params: Record<string, any> = {};

    if (filters.skills?.length) params.skills = filters.skills.join(",");
    if (filters.experience_min !== undefined) params.exp_min = filters.experience_min;
    if (filters.experience_max !== undefined) params.exp_max = filters.experience_max;
    if (filters.education_level?.length) params.education = filters.education_level.join(",");
    if (filters.location) params.location = filters.location;
    if (filters.availability_status) params.availability = filters.availability_status;
    if (filters.salary_min !== undefined) params.salary_min = filters.salary_min;
    if (filters.salary_max !== undefined) params.salary_max = filters.salary_max;
    if (filters.search_query) params.q = filters.search_query;
    if (filters.sort_by) params.sort = filters.sort_by;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    return params;
  }
}

export const candidateSearchService = new CandidateSearchService();
