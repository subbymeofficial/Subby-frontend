import apiClient, { unwrap } from "@/lib/api-client";

export type VerificationDocumentType = "qualification" | "id" | "abn" | "insurance";
export type VerificationDocumentStatus = "pending" | "approved" | "rejected";

export interface VerificationDocument {
  _id: string;
  userId: string;
  type: VerificationDocumentType;
  documentUrl: string;
  status: VerificationDocumentStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  createdAt?: string;
}

export const verificationAdminService = {
  async getDocsForUser(userId: string): Promise<VerificationDocument[]> {
    const res = await apiClient.get(`/admin/verification/user/${userId}`);
    return unwrap(res);
  },

  async approveDocument(id: string): Promise<VerificationDocument> {
    const res = await apiClient.patch(`/admin/verification/${id}/approve`);
    return unwrap(res);
  },

  async rejectDocument(id: string, reason: string): Promise<VerificationDocument> {
    const res = await apiClient.patch(`/admin/verification/${id}/reject`, { reason });
    return unwrap(res);
  },
};

