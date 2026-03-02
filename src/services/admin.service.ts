import apiClient, { unwrap } from "@/lib/api-client";
import type { User, Listing, Application, Review } from "@/lib/types";
import type { TransactionRecord } from "@/services/payments.service";

export interface AdminStats {
  users: { total: number; client: number; contractor: number; admin: number };
  listings: { total: number; byStatus: Record<string, number> };
  subscriptions: { active: number; trialing: number; expired: number; total: number };
  applications: { total: number; byStatus: Record<string, number> };
  revenue: {
    total: number;
    transactionCount: number;
    byMonth?: { month: string; total: number }[];
  };
  jobsByCategory?: { category: string; count: number }[];
  bookings?: { completed: number };
  reviews: { total: number };
}

export const adminService = {
  async getStats(params?: { from?: string; to?: string }): Promise<AdminStats> {
    const res = await apiClient.get("/admin/stats", { params });
    return unwrap(res);
  },

  async getUsers(params: { page?: number; limit?: number; search?: string; role?: string } = {}): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/users", { params });
    return unwrap(res);
  },

  async setUserStatus(id: string, isActive: boolean): Promise<User> {
    const res = await apiClient.patch(`/admin/users/${id}/status`, { isActive });
    return unwrap(res);
  },

  async setUserVerified(id: string, isVerified: boolean): Promise<User> {
    // Deprecated: verification is managed via documents, not direct toggles.
    throw new Error("Direct verification toggle is not supported. Use document-based verification.");
  },

  async setSubscription(id: string, status: string | null, plan: string | null): Promise<User> {
    const res = await apiClient.patch(`/admin/users/${id}/subscription`, { status, plan });
    return unwrap(res);
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  },

  async getListings(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ listings: Listing[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/listings", { params });
    return unwrap(res);
  },

  async getApplications(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ applications: Application[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/applications", { params });
    return unwrap(res);
  },

  async getTransactions(params: { page?: number; limit?: number; type?: string; status?: string } = {}): Promise<{ transactions: TransactionRecord[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/transactions", { params });
    return unwrap(res);
  },

  async getReviews(params: { page?: number; limit?: number } = {}): Promise<{ reviews: Review[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/reviews", { params });
    return unwrap(res);
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/admin/reviews/${id}`);
  },

  async removeUserProfileImage(userId: string): Promise<User> {
    const res = await apiClient.delete(`/admin/users/${userId}/profile-image`);
    return unwrap(res);
  },

  async getPromoCodes(params: { page?: number; limit?: number } = {}): Promise<{ promoCodes: PromoCode[]; total: number; page: number; limit: number }> {
    const res = await apiClient.get("/admin/promo-codes", { params });
    return unwrap(res);
  },

  async getPromoCodeById(id: string): Promise<PromoCode> {
    const res = await apiClient.get(`/admin/promo-codes/${id}`);
    return unwrap(res);
  },

  async createPromoCode(data: CreatePromoCodeData): Promise<PromoCode> {
    const res = await apiClient.post("/admin/promo-codes", data);
    return unwrap(res);
  },

  async updatePromoCode(id: string, data: UpdatePromoCodeData): Promise<PromoCode> {
    const res = await apiClient.patch(`/admin/promo-codes/${id}`, data);
    return unwrap(res);
  },

  async deletePromoCode(id: string): Promise<void> {
    await apiClient.delete(`/admin/promo-codes/${id}`);
  },
};

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "free_time";
  discountValue: number;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdBy?: { _id: string; name: string; email: string };
  createdAt?: string;
}

export interface CreatePromoCodeData {
  code: string;
  discountType: "percentage" | "free_time";
  discountValue: number;
  expiryDate: string;
  usageLimit?: number | null;
  isActive?: boolean;
}

export interface UpdatePromoCodeData {
  code?: string;
  discountType?: "percentage" | "free_time";
  discountValue?: number;
  expiryDate?: string;
  usageLimit?: number | null;
  isActive?: boolean;
}
