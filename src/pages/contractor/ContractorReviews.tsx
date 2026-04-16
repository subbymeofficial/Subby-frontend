import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RatingStars } from "@/components/RatingStars";
import { useUserReviews } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { contractorNavItems } from "./ContractorOverview";
import { Loader2, AlertTriangle } from "lucide-react";
import type { User } from "@/lib/types";

export default function ContractorReviews() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { data, isLoading, isError } = useUserReviews(userId);
  const reviews = data?.reviews ?? [];

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      <h2 className="mb-4 text-lg font-semibold text-foreground">My Reviews</h2>
      {data?.averageRating !== undefined && data.averageRating > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <RatingStars rating={data.averageRating} />
          <span className="text-sm text-muted-foreground">({data.total} reviews)</span>
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : isError ? (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
        <p className="mt-2 font-medium text-destructive">Failed to load reviews</p>
        <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => {
            const reviewer = typeof r.reviewerId === "object" ? (r.reviewerId as User) : null;
            return (
              <div key={r._id} className="rounded-lg border bg-card p-5 card-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{reviewer?.name || "Anonymous"}</span>
                  <span className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                </div>
                <div className="mt-1"><RatingStars rating={r.rating} size={14} /></div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
