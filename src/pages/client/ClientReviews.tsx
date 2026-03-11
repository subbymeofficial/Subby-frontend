import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { RatingStars } from "@/components/RatingStars";
import { clientNavItems } from "./ClientOverview";
import { useUserReviews, useMyListings, useCreateReview } from "@/hooks/use-api";
import { useAuth, getApiError } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, PenSquare } from "lucide-react";
import type { User } from "@/lib/types";

export default function ClientReviews() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { data, isLoading } = useUserReviews(userId);
  const { data: listings } = useMyListings();
  const createReview = useCreateReview();
  const { toast } = useToast();
  const reviews = data?.reviews ?? [];

  const completedJobs = listings?.filter((l) => l.status === "completed" && l.assignedContractorId) ?? [];

  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ listingId: "", revieweeId: "", rating: "5", comment: "" });

  const handleListingSelect = (listingId: string) => {
    const listing = completedJobs.find((l) => l._id === listingId);
    const contractorId = listing?.assignedContractorId
      ? typeof listing.assignedContractorId === "object"
        ? listing.assignedContractorId._id
        : listing.assignedContractorId
      : "";
    setReviewForm({ ...reviewForm, listingId, revieweeId: contractorId });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReview.mutateAsync({
        listingId: reviewForm.listingId,
        revieweeId: reviewForm.revieweeId,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
        type: "client_to_contractor",
      });
      toast({ title: "Success", description: "Review submitted. It will be published after admin approval." });
      setShowForm(false);
      setReviewForm({ listingId: "", revieweeId: "", rating: "5", comment: "" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">My Reviews</h2>
        {completedJobs.length > 0 && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <PenSquare size={16} className="mr-1" /> Leave Review
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-6 rounded-lg border bg-card p-6 card-shadow space-y-4">
          <div className="space-y-2">
            <Label>Completed Job</Label>
            <Select value={reviewForm.listingId} onValueChange={handleListingSelect}>
              <SelectTrigger><SelectValue placeholder="Select a completed job" /></SelectTrigger>
              <SelectContent>
                {completedJobs.map((l) => (
                  <SelectItem key={l._id} value={l._id}>{l.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewForm({ ...reviewForm, rating: String(n) })}
                  className="p-0.5"
                >
                  <Star
                    size={24}
                    className={Number(reviewForm.rating) >= n ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Comment</Label>
            <Textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              rows={3}
              required
              placeholder="How was your experience?"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createReview.isPending || !reviewForm.listingId}>
              {createReview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Review
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-muted-foreground">You haven't received any reviews yet.</p>
        </div>
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
