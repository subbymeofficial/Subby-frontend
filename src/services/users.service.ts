import apiClient, { unwrap } from "@/lib/api-client";
import type { User } from "@/lib/types";

export interface ContractorSearchParams {
  trade?: string;
  location?: string;
  minRating?: number;
  isVerified?: boolean;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  page?: number;
  limit?: number;
}

export const usersService = {
  async getContractors(params: ContractorSearchParams = {}): Promise<{ contractors: User[]; total: number }> {
    const res = await apiClient.get("/users/contractors", { params });
    return unwrap(res);
  },

  async getUserById(id: string): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    return unwrap(res);
  },

  async updateProfile(id: string, data: Partial<User>): Promise<User> {
    const res = await apiClient.patch(`/users/${id}`, data);
    return unwrap(res);
  },

  async getSavedContractors(): Promise<User[]> {
    const res = await apiClient.get("/users/saved-contractors/list");
    return unwrap(res);
  },

  async saveContractor(contractorId: string): Promise<User> {
    const res = await apiClient.post(`/users/save-contractor/${contractorId}`);
    return unwrap(res);
  },

  async unsaveContractor(contractorId: string): Promise<User> {
    const res = await apiClient.delete(`/users/save-contractor/${contractorId}`);
    return unwrap(res);
  },

  async toggleAvailability(): Promise<User> {
    const res = await apiClient.patch("/users/toggle-availability");
    return unwrap(res);
  },

  async uploadProfileImage(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await apiClient.put("/users/profile-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrap(res);
  },

  async deleteProfileImage(): Promise<User> {
    const res = await apiClient.delete("/users/profile-image");
    return unwrap(res);
  },

  async deleteSelf(): Promise<void> {
    await apiClient.delete("/users/me");
  },
  async switchRole(role: "CLIENT" | "CONTRACTOR"): Promise<{ activeRole: string; roles: string[] }> {
    const res = await apiClient.post("/users/me/switch-role", { role });
    return unwrap(res);
  },

  async updateAvailability(data: { isAvailable?: boolean; busyDates?: string[] }): Promise<{ isAvailable: boolean; busyDates: string[] }> {
    const res = await apiClient.patch("/users/me/availability", data);
    return unwrap(res);
  },

  async addContractorRole(body: { successUrl?: string; cancelUrl?: string; plan?: string } = {}): Promise<{ url: string; sessionId: string }> {
    const res = await apiClient.post("/users/me/add-contractor-role", body);
    return unwrap(res);
  },
};
