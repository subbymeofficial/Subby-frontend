import apiClient, { unwrap } from "@/lib/api-client";
import type { AuthResponse, User } from "@/lib/types";

export const authService = {
  async register(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await apiClient.post("/auth/register", data);
    return unwrap(res);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await apiClient.post("/auth/login", data);
    return unwrap(res);
  },

  async getProfile(): Promise<User> {
    const res = await apiClient.get("/auth/profile");
    return unwrap(res);
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const res = await apiClient.post("/auth/refresh");
    return unwrap(res);
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const res = await apiClient.post("/auth/change-password", data);
    return unwrap(res);
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiClient.post("/auth/forgot-password", { email });
    return unwrap(res);
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const res = await apiClient.post("/auth/reset-password", { token, password });
    return unwrap(res);
  },

  getGoogleAuthUrl(role: string = "client", intent: "login" | "register" = "login"): string {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";
    return `${baseUrl}/auth/google?role=${role}&intent=${intent}`;
    
  },
};
