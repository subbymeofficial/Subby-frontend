export type UserRole = "client" | "contractor" | "admin";

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  googleId?: string;
  avatar?: string;
  profileImage?: { public_id: string; url: string } | null;
  phone?: string;
  location?: string;
  bio?: string;
  trade?: string;
  hourlyRate?: number;
  skills: string[];
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  subscriptionPlan?: "standard" | "premium" | null;
  subscriptionStatus?: "active" | "trialing" | "past_due" | "cancelled" | null;
  subscriptionExpiresAt?: string | null;
  hasQualificationUpgrade?: boolean;
  stripeCustomerId?: string;
  savedContractors?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Listing {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget?: { min: number; max: number; currency: string };
  clientId: string | User;
  status: "open" | "in_progress" | "completed" | "cancelled";
  skills: string[];
  urgency: "low" | "medium" | "high" | "urgent";
  attachments: string[];
  applicationCount: number;
  assignedContractorId?: string | User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Application {
  _id: string;
  id?: string;
  listingId: string | Listing;
  contractorId: string | User;
  coverLetter: string;
  proposedRate?: number;
  proposedTimeline?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  id?: string;
  reviewerId: string | User;
  revieweeId: string | User;
  listingId: string | Listing;
  rating: number;
  comment: string;
  type: "client_to_contractor" | "contractor_to_client";
  status?: "pending" | "approved" | "rejected";
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  [key: string]: T[] | number;
}

