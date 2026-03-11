import apiClient, { unwrap } from "@/lib/api-client";
import type { Review } from "@/lib/types";

export interface CreateReviewData {
  revieweeId: string;
  listingId: string;
  rating: number;
  comment: string;
  type: "client_to_contractor" | "contractor_to_client";
}

export const reviewsService = {
  async create(data: CreateReviewData): Promise<Review> {
    const res = await apiClient.post("/reviews", data);
    return unwrap(res);
  },

  async getByUser(userId: string, page = 1, limit = 20): Promise<{ reviews: Review[]; total: number; averageRating: number }> {
    const res = await apiClient.get(`/reviews/user/${userId}`, { params: { page, limit } });
    return unwrap(res);
  },

  async getAll(page = 1, limit = 20): Promise<{ reviews: Review[]; total: number }> {
    const res = await apiClient.get("/reviews", { params: { page, limit } });
    return unwrap(res);
  },

  async getFeatured(limit = 8): Promise<Review[]> {
    const res = await apiClient.get("/reviews/featured", { params: { limit } });
    return unwrap(res);
  },

  async getById(id: string): Promise<Review> {
    const res = await apiClient.get(`/reviews/${id}`);
    return unwrap(res);
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
  },
};
