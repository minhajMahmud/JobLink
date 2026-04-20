import axios, { AxiosInstance } from "axios";
import type {
  JobPromotion,
  JobPromotionStats,
  CompanyPost,
  PostEngagement,
  PostFeed,
} from "@/modules/recruiter/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

class JobPromotionService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/recruiter/promotions`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Create a featured job promotion
   */
  async promoteJob(jobId: string, duration_days: 7 | 15 | 30): Promise<JobPromotion> {
    const response = await this.api.post<JobPromotion>("/create", {
      job_id: jobId,
      duration_days,
    });
    return response.data;
  }

  /**
   * Get promotion by ID
   */
  async getPromotion(promotionId: string): Promise<JobPromotion> {
    const response = await this.api.get<JobPromotion>(`/${promotionId}`);
    return response.data;
  }

  /**
   * Get all promotions for recruiter
   */
  async getMyPromotions(status?: string): Promise<JobPromotion[]> {
    const response = await this.api.get<JobPromotion[]>("/my-promotions", { params: { status } });
    return response.data;
  }

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<JobPromotion[]> {
    const response = await this.api.get<JobPromotion[]>("/active");
    return response.data;
  }

  /**
   * Update promotion duration
   */
  async updatePromotionDuration(
    promotionId: string,
    duration_days: 7 | 15 | 30,
  ): Promise<JobPromotion> {
    const response = await this.api.put<JobPromotion>(`/${promotionId}/duration`, {
      duration_days,
    });
    return response.data;
  }

  /**
   * Cancel promotion
   */
  async cancelPromotion(promotionId: string): Promise<void> {
    await this.api.post(`/${promotionId}/cancel`);
  }

  /**
   * Get promotion statistics
   */
  async getPromotionStats(promotionId: string): Promise<JobPromotionStats> {
    const response = await this.api.get<JobPromotionStats>(`/${promotionId}/stats`);
    return response.data;
  }

  /**
   * Get daily analytics for promotion
   */
  async getDailyAnalytics(
    promotionId: string,
    from_date: string,
    to_date: string,
  ): Promise<Array<{ date: string; views: number; clicks: number; applications: number }>> {
    const response = await this.api.get<
      Array<{ date: string; views: number; clicks: number; applications: number }>
    >(`/${promotionId}/analytics`, { params: { from_date, to_date } });
    return response.data;
  }

  /**
   * Get pricing tiers
   */
  async getPricingTiers(): Promise<
    Array<{ duration: number; price: number; discount?: number }>
  > {
    const response = await this.api.get<
      Array<{ duration: number; price: number; discount?: number }>
    >("/pricing");
    return response.data;
  }

  /**
   * Process payment for promotion
   */
  async processPayment(
    promotionId: string,
    paymentMethod: "card" | "paypal" | "invoice",
  ): Promise<{ success: boolean; payment_id: string }> {
    const response = await this.api.post<{
      success: boolean;
      payment_id: string;
    }>(`/${promotionId}/payment`, { payment_method: paymentMethod });
    return response.data;
  }

  /**
   * Get ROI for promotion
   */
  async getROI(promotionId: string): Promise<{
    cost: number;
    applications: number;
    hires: number;
    roi_percentage: number;
  }> {
    const response = await this.api.get<{
      cost: number;
      applications: number;
      hires: number;
      roi_percentage: number;
    }>(`/${promotionId}/roi`);
    return response.data;
  }
}

class CompanyPostService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE}/recruiter/posts`,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Create a company post
   */
  async createPost(
    content: string,
    media?: Array<{ type: string; url: string }>,
  ): Promise<CompanyPost> {
    const response = await this.api.post<CompanyPost>("/create", { content, media });
    return response.data;
  }

  /**
   * Get post by ID
   */
  async getPost(postId: string): Promise<CompanyPost> {
    const response = await this.api.get<CompanyPost>(`/${postId}`);
    return response.data;
  }

  /**
   * Get company feed
   */
  async getCompanyFeed(
    companyId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PostFeed> {
    const response = await this.api.get<PostFeed>(`/company/${companyId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get recruiter's posts
   */
  async getMyPosts(page: number = 1, limit: number = 20): Promise<PostFeed> {
    const response = await this.api.get<PostFeed>("/my-posts", { params: { page, limit } });
    return response.data;
  }

  /**
   * Update post
   */
  async updatePost(postId: string, content: string): Promise<CompanyPost> {
    const response = await this.api.put<CompanyPost>(`/${postId}`, { content });
    return response.data;
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<void> {
    await this.api.delete(`/${postId}`);
  }

  /**
   * Like/Unlike post
   */
  async toggleLike(postId: string): Promise<{ liked: boolean; likes_count: number }> {
    const response = await this.api.post<{ liked: boolean; likes_count: number }>(
      `/${postId}/like`,
    );
    return response.data;
  }

  /**
   * Add comment to post
   */
  async addComment(postId: string, content: string): Promise<PostEngagement> {
    const response = await this.api.post<PostEngagement>(`/${postId}/comment`, { content });
    return response.data;
  }

  /**
   * Get post comments
   */
  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<PostEngagement[]> {
    const response = await this.api.get<PostEngagement[]>(`/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Delete comment
   */
  async deleteComment(postId: string, commentId: string): Promise<void> {
    await this.api.delete(`/${postId}/comment/${commentId}`);
  }

  /**
   * Share post
   */
  async sharePost(postId: string, platform?: string): Promise<{ url: string }> {
    const response = await this.api.post<{ url: string }>(`/${postId}/share`, { platform });
    return response.data;
  }

  /**
   * Promote post (boost reach)
   */
  async promotePost(postId: string, budget: number, duration_days: number): Promise<void> {
    await this.api.post(`/${postId}/promote`, { budget, duration_days });
  }

  /**
   * Get post analytics
   */
  async getPostAnalytics(postId: string): Promise<{
    views: number;
    clicks: number;
    likes: number;
    comments: number;
    shares: number;
    engagement_rate: number;
  }> {
    const response = await this.api.get<{
      views: number;
      clicks: number;
      likes: number;
      comments: number;
      shares: number;
      engagement_rate: number;
    }>(`/${postId}/analytics`);
    return response.data;
  }

  /**
   * Get trending posts
   */
  async getTrendingPosts(limit: number = 10): Promise<CompanyPost[]> {
    const response = await this.api.get<CompanyPost[]>("/trending", { params: { limit } });
    return response.data;
  }

  /**
   * Search posts
   */
  async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<PostFeed> {
    const response = await this.api.get<PostFeed>("/search", {
      params: { q: query, page, limit },
    });
    return response.data;
  }
}

export const jobPromotionService = new JobPromotionService();
export const companyPostService = new CompanyPostService();
