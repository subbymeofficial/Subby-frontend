import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, Clock, ArrowLeft, Calendar, Loader2, LogIn, Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { useUser, useUserReviews, useSaveContractor, useUnsaveContractor, useCreateConversation } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@/lib/types";

export default function ContractorProfile() {
  const { id } = useParams();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const { data: contractor, isLoading, isError } = useUser(id);
  const { data: reviewsData } = useUserReviews(id);
  const saveContractor = useSaveContractor();
  const unsaveContractor = useUnsaveContractor();
  const createConversation = useCreateConversation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const reviews = reviewsData?.reviews ?? [];
  const isClient = currentUser?.role === "client";
  const isSaved = isClient && currentUser?.savedContractors?.includes(id || "");

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-main py-20 text-center">
          <div className="mx-auto max-w-md rounded-lg border bg-card p-8 card-shadow">
            <LogIn className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">Login Required</h1>
            <p className="mt-2 text-muted-foreground">
              Please log in to view contractor profiles.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild>
                <Link to={`/login?redirect=/contractors/${id}`}>Log In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contractors">Back to Contractors</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !contractor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-main py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Contractor not found</h1>
          <Button asChild className="mt-4"><Link to="/contractors">Back to Listings</Link></Button>
        </div>
      </div>
    );
  }

  const avatarUrl = contractor.profileImage?.url || contractor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contractor.name}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-8">
        <Link to="/contractors" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Contractors
        </Link>

        <div className="rounded-lg border bg-card p-6 card-shadow">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <img src={avatarUrl} alt={contractor.name} className="h-28 w-28 shrink-0 rounded-xl bg-secondary object-cover" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-2xl font-bold text-foreground">{contractor.name}</h1>
                {contractor.isVerified && <VerifiedBadge />}
              </div>
              <p className="mt-1 text-lg font-medium text-primary">{contractor.trade || "General"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} /> {contractor.location || "Location not set"}</span>
                {contractor.hourlyRate && <span className="flex items-center gap-1"><Clock size={14} /> ${contractor.hourlyRate}/hr</span>}
                <span className={`flex items-center gap-1 font-medium ${contractor.isActive ? "text-success" : "text-destructive"}`}>
                  {contractor.isActive ? "Available" : "Unavailable"}
                </span>
              </div>
              <div className="mt-2">
                <RatingStars rating={contractor.averageRating || 0} reviewCount={contractor.reviewCount || 0} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="lg"
                onClick={async () => {
                  if (!id) return;
                  try {
                    const conv = await createConversation.mutateAsync({
                      participantId: id,
                    });
                    navigate(`/messages?c=${conv._id}`);
                  } catch (e) {
                    toast({
                      title: "Could not start chat",
                      description: String(e),
                      variant: "destructive",
                    });
                  }
                }}
                disabled={createConversation.isPending}
              >
                <MessageSquare size={16} className="mr-2" /> Message
              </Button>
              {isClient && (
                <Button
                  size="lg"
                  variant={isSaved ? "destructive" : "outline"}
                  onClick={() => {
                    if (!id) return;
                    if (isSaved) {
                      unsaveContractor.mutate(id, {
                        onSuccess: () => toast({ title: "Removed from saved contractors" }),
                      });
                    } else {
                      saveContractor.mutate(id, {
                        onSuccess: () => toast({ title: "Contractor saved!" }),
                      });
                    }
                  }}
                  disabled={saveContractor.isPending || unsaveContractor.isPending}
                >
                  <Heart size={16} className={`mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Unsave" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-lg border bg-card p-6 card-shadow">
              <h2 className="text-lg font-semibold text-foreground">About</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{contractor.bio || "No description provided."}</p>
            </section>

            {contractor.skills && contractor.skills.length > 0 && (
              <section className="rounded-lg border bg-card p-6 card-shadow">
                <h2 className="text-lg font-semibold text-foreground">Skills & Attributes</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {contractor.skills.map((s) => (
                    <span key={s} className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">{s}</span>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-lg border bg-card p-6 card-shadow">
              <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
              {reviews.length === 0 ? (
                <p className="mt-3 text-muted-foreground">No reviews yet.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {reviews.map((r) => {
                    const reviewer = typeof r.reviewerId === "object" ? (r.reviewerId as UserType) : null;
                    return (
                      <div key={r._id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{reviewer?.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}</span>
                        </div>
                        <div className="mt-1"><RatingStars rating={r.rating} size={14} showValue={false} /></div>
                        <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-lg border bg-card p-6 card-shadow">
              <h3 className="flex items-center gap-2 font-semibold text-foreground"><Calendar size={16} /> Member Since</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {contractor.createdAt ? new Date(contractor.createdAt).toLocaleDateString("en-AU", { year: "numeric", month: "long" }) : "N/A"}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
