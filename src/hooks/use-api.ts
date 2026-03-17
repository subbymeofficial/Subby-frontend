import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService, type ContractorSearchParams } from "@/services/users.service";
import { listingsService, type ListingSearchParams, type CreateListingData } from "@/services/listings.service";
import { applicationsService, type CreateApplicationData } from "@/services/applications.service";
import { reviewsService, type CreateReviewData } from "@/services/reviews.service";
import { adminService } from "@/services/admin.service";
import { verificationAdminService } from "@/services/verification-admin.service";
import { verificationService } from "@/services/verification.service";
import { paymentsService } from "@/services/payments.service";
import { categoriesService } from "@/services/categories.service";
import { authService } from "@/services/auth.service";
import { conversationsService } from "@/services/conversations.service";
import { messagesService } from "@/services/messages.service";
import { notificationsService } from "@/services/notifications.service";
import { tradesService } from "@/services/trades.service";
import { availabilityService } from "@/services/availability.service";

// ── Contractors / Users ──
export function useContractors(params: ContractorSearchParams = {}) {
  return useQuery({
    queryKey: ["contractors", params],
    queryFn: () => usersService.getContractors(params),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => usersService.getUserById(id!),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      usersService.updateProfile(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["user", vars.id] });
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(data),
  });
}

export function useSavedContractors() {
  return useQuery({
    queryKey: ["saved-contractors"],
    queryFn: () => usersService.getSavedContractors(),
  });
}

export function useSaveContractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contractorId: string) => usersService.saveContractor(contractorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-contractors"] });
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export function useUnsaveContractor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contractorId: string) => usersService.unsaveContractor(contractorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved-contractors"] });
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

// ── Listings ──
export function useListings(params: ListingSearchParams = {}) {
  return useQuery({
    queryKey: ["listings", params],
    queryFn: () => listingsService.getAll(params),
  });
}

export function useMyListings(status?: string) {
  return useQuery({
    queryKey: ["my-listings", status],
    queryFn: () => listingsService.getMyListings(status),
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateListingData) => listingsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      listingsService.update(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["listing", vars.id] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => listingsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

// ── Applications ──
export function useMyApplications() {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationsService.getMyApplications(),
  });
}

export function useListingApplications(listingId: string | undefined) {
  return useQuery({
    queryKey: ["listing-applications", listingId],
    queryFn: () => applicationsService.getByListing(listingId!),
    enabled: !!listingId,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationData) => applicationsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["listing-applications"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsService.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["listing-applications"] });
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["listing-applications"] });
    },
  });
}

// ── Reviews ──
export function useUserReviews(userId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ["reviews", userId, page],
    queryFn: () => reviewsService.getByUser(userId!, page),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReviewData) => reviewsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reviewsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

// ── Admin ──
export function useAdminStats(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ["admin-stats", params],
    queryFn: () => adminService.getStats(params),
  });
}

export function useAdminUsers(params: { page?: number; limit?: number; search?: string; role?: string } = {}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminService.getUsers(params),
  });
}

export function useAdminListings(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-listings", params],
    queryFn: () => adminService.getListings(params),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.setUserStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useSetUserVerified() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) =>
      adminService.setUserVerified(id, isVerified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

// ── Verification (Contractor) ──
export function useMyVerificationDocs() {
  return useQuery({
    queryKey: ["my-verification-docs"],
    queryFn: () => verificationService.getMyDocuments(),
  });
}

export function useUploadVerificationDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file, expiryDate }: { type: import("@/services/verification.service").VerificationDocumentType; file: File; expiryDate: string }) =>
      verificationService.uploadDocument(type, file, expiryDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-verification-docs"] });
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

// ── Verification (Admin) ──
export function useVerificationDocsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ["verification-docs", userId],
    queryFn: () => verificationAdminService.getDocsForUser(userId!),
    enabled: !!userId,
  });
}

export function useSetSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, plan }: { id: string; status: string | null; plan: string | null }) =>
      adminService.setSubscription(id, status, plan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminApplications(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-applications", params],
    queryFn: () => adminService.getApplications(params),
  });
}

export function useAdminTransactions(params: { page?: number; limit?: number; type?: string; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-transactions", params],
    queryFn: () => adminService.getTransactions(params),
  });
}

export function useAdminReviews(params: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => adminService.getReviews(params),
  });
}

export function useAdminApproveReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.approveReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminRejectReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.rejectReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useFeaturedReviews(limit = 8) {
  return useQuery({
    queryKey: ["featured-reviews", limit],
    queryFn: () => reviewsService.getFeatured(limit),
  });
}

export function useAdminRemoveProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminService.removeUserProfileImage(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useAdminDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });
}

export function useAdminPromoCodes(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-promo-codes", page, limit],
    queryFn: () => adminService.getPromoCodes({ page, limit }),
  });
}

export function useCreatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: import("@/services/admin.service").CreatePromoCodeData) =>
      adminService.createPromoCode(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
  });
}

export function useUpdatePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: import("@/services/admin.service").UpdatePromoCodeData }) =>
      adminService.updatePromoCode(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
  });
}

export function useDeletePromoCode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deletePromoCode(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-promo-codes"] });
    },
  });
}

export function useUploadProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => usersService.uploadProfileImage(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export function useDeleteProfileImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersService.deleteProfileImage(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-user"] });
    },
  });
}

export function useDeleteSelfAccount() {
  return useMutation({
    mutationFn: () => usersService.deleteSelf(),
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => usersService.toggleAvailability(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["auth-user"] });
      qc.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

// ── Payments ──
export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: () => paymentsService.getSubscriptionStatus(),
  });
}

export function useMyTransactions() {
  return useQuery({
    queryKey: ["my-transactions"],
    queryFn: () => paymentsService.getMyTransactions(),
  });
}

export function useCreateSubscription() {
  return useMutation({
    mutationFn: ({ plan, promoCodeId }: { plan: "standard" | "premium"; promoCodeId?: string }) =>
      paymentsService.createSubscription(plan, promoCodeId),
  });
}

export function useCreateClientSubscription() {
  return useMutation({
    mutationFn: () => paymentsService.createClientSubscription(),
  });
}

export function useValidatePromo() {
  return useMutation({
    mutationFn: ({ code, plan }: { code: string; plan: "standard" | "premium" }) =>
      paymentsService.validatePromo(code, plan),
  });
}

export function useUpgradeQualification() {
  return useMutation({
    mutationFn: () => paymentsService.upgradeQualification(),
  });
}

export function useCreateJobPayment() {
  return useMutation({
    mutationFn: (data: { listingId: string; contractorId: string; amount: number }) =>
      paymentsService.createJobPayment(data),
  });
}

export function useReleaseJobPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (transactionId: string) => paymentsService.releaseJobPayment(transactionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-transactions"] });
    },
  });
}

export function useContractorEarnings() {
  return useQuery({
    queryKey: ["contractor-earnings"],
    queryFn: () => paymentsService.getContractorEarnings(),
  });
}

// ── Categories ──
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.getActive(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoriesService.getAll(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; icon?: string; iconFile?: File }) =>
      categoriesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-all"] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name?: string; icon?: string; isActive?: boolean; iconFile?: File };
    }) => categoriesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-all"] });
    },
  });
}

export function useRemoveCategoryIcon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.removeIcon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-all"] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      qc.invalidateQueries({ queryKey: ["categories-all"] });
    },
  });
}

// ── Conversations / Messages ──
export function useConversations(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["conversations", page, limit],
    queryFn: () => conversationsService.getMine(page, limit),
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => conversationsService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { participantId: string; jobId?: string }) =>
      conversationsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useConversationUnreadCount() {
  return useQuery({
    queryKey: ["conversation-unread"],
    queryFn: () => conversationsService.getUnreadCount(),
  });
}

export function useMessages(conversationId: string | undefined, page = 1) {
  return useQuery({
    queryKey: ["messages", conversationId, page],
    queryFn: () => messagesService.getByConversation(conversationId!, page),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      text,
      attachments,
    }: {
      conversationId: string;
      text?: string;
      attachments?: File[];
    }) => messagesService.create({ conversationId, text }, attachments),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["conversation-unread"] });
    },
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      messageIds,
    }: {
      conversationId: string;
      messageIds?: string[];
    }) => messagesService.markAsRead(conversationId, messageIds),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
      qc.invalidateQueries({ queryKey: ["conversation-unread"] });
    },
  });
}

// ── Notifications ──
export function useNotifications(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["notifications", page, limit],
    queryFn: () => notificationsService.getMine(page, limit),
  });
}

export function useNotificationUnreadCount() {
  return useQuery({
    queryKey: ["notification-unread"],
    queryFn: () => notificationsService.getUnreadCount(),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-unread"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notification-unread"] });
    },
  });
}

// ── Trades ──
export function useTrades() {
  return useQuery({
    queryKey: ["trades"],
    queryFn: () => tradesService.getAll(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrade(id: string | undefined) {
  return useQuery({
    queryKey: ["trade", id],
    queryFn: () => tradesService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => tradesService.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trades"] }),
  });
}

export function useUpdateTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      tradesService.update(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trades"] }),
  });
}

export function useDeleteTrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tradesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trades"] }),
  });
}

export function useAddSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, name }: { tradeId: string; name: string }) =>
      tradesService.addSubcategory(tradeId, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trades"] }),
  });
}

export function useRemoveSubcategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tradeId, slug }: { tradeId: string; slug: string }) =>
      tradesService.removeSubcategory(tradeId, slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trades"] }),
  });
}

// ── Availability ──
export function useMyAvailability() {
  return useQuery({
    queryKey: ["my-availability"],
    queryFn: () => availabilityService.getMine(),
  });
}

export function useContractorAvailability(contractorId: string | undefined) {
  return useQuery({
    queryKey: ["contractor-availability", contractorId],
    queryFn: () => availabilityService.getByContractor(contractorId!),
    enabled: !!contractorId,
  });
}

export function useAddUnavailableDates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dates: string[]) => availabilityService.addUnavailableDates(dates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-availability"] });
      qc.invalidateQueries({ queryKey: ["contractor-availability"] });
    },
  });
}

export function useRemoveUnavailableDates() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dates: string[]) =>
      availabilityService.removeUnavailableDates(dates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-availability"] });
      qc.invalidateQueries({ queryKey: ["contractor-availability"] });
    },
  });
}
