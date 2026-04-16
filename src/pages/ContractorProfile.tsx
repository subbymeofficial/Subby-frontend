import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, MessageSquare, Clock, ArrowLeft, Calendar, Loader2, LogIn, Heart, ShieldCheck, BadgeCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RatingStars } from "@/components/RatingStars";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import { useUser, useUserReviews, useSaveContractor, useUnsaveContractor, useCreateConversation } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@/lib/types";

type TicketEntry = { name: string; expiry?: string; photoDataUrl?: string };

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
            <p className="mt-2 text-muted-foreground">Please log in to view contractor profiles.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild><Link to={`/login?redirect=/contractors/${id}`}>Log In</Link></Button>
              <Button asChild variant="outline"><Link to="/contractors">Back to Contractors</Link></Button>
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

  const c = contractor as any;
  const avatarUrl = contractor.profileImage?.url || contractor.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${contractor.name}`;
  const currencyPrefix = c.market === "US" ? "USD $" : "AUD $";
  const trades: string[] = c.trades?.length > 0
    ? c.trades
    : contractor.trade ? [contractor.trade] : [];
  const tickets: TicketEntry[] = Array.isArray(c.tickets) ? c.tickets : [];
  const insurance: string[] = Array.isArray(c.insurance) ? c.insurance : [];
  const availableDays: string[] = Array.isArray(c.availableDays) ? c.availableDays : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-8">
        <Link to="/contractors" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Contractors
        </Link>

        {/* Header card */}
        <div className="rounded-lg border bg-card p-6 card-shadow">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <img src={avatarUrl} alt={contractor.name}
              className="h-28 w-28 shrink-0 rounded-xl bg-secondary object-cover" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-2xl font-bold text-foreground">{contractor.name}</h1>
                {contractor.isVerified && <VerifiedBadge />}
              </div>

              {/* Trades */}
              {trades.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {trades.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 text-primary text-sm font-medium px-3 py-0.5">
                      {t.includes(" > ") ? t.split(" > ").pop() : t}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin size={14} /> {contractor.location || "Location not set"}</span>
                {contractor.hourlyRate && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {currencyPrefix}{contractor.hourlyRate}/hr
                  </span>
                )}
                <span className={`flex items-center gap-1 font-medium ${contractor.isActive ? "text-success" : "text-destructive"}`}>
                  {contractor.isActive ? "✓ Available" : "Unavailable"}
                </span>
              </div>
              <div className="mt-2">
                <RatingStars rating={contractor.averageRating || 0} reviewCount={contractor.reviewCount || 0} />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-2 sm:min-w-[160px]">
              <Button size="lg" onClick={async () => {
                if (!id) return;
                try {
                  const conv = await createConversation.mutateAsync({ participantId: id });
                  navigate(`/messages?c=${conv._id}`);
                } catch (e) {
                  toast({ title: "Could not start chat", description: String(e), variant: "destructive" });
                }
              }} disabled={createConversation.isPending}>
                <MessageSquare size={16} className="mr-2" /> Message
              </Button>
              {isClient && (
                <Button size="lg" variant={isSaved ? "destructive" : "outline"}
                  onClick={() => {
                    if (!id) return;
                    if (isSaved) {
                      unsaveContractor.mutate(id, { onSuccess: () => toast({ title: "Removed from saved" }) });
                    } else {
                      saveContractor.mutate(id, { onSuccess: () => toast({ title: "Contractor saved!" }) });
                    }
                  }}
                  disabled={saveContractor.isPending || unsaveContractor.isPending}>
                  <Heart size={16} className={`mr-2 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Unsave" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Bio */}
            <section className="rounded-lg border bg-card p-6 card-shadow">
              <h2 className="text-lg font-semibold text-foreground">About</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {contractor.bio || "No description provided."}
              </p>
            </section>

            {/* Skills */}
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

            {/* Tickets & Certifications */}
            {tickets.length > 0 && (
              <section className="rounded-lg border bg-card p-6 card-shadow">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <BadgeCheck size={18} className="text-amber-600" />
                  Licences & Certifications
                </h2>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tickets.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      {t.photoDataUrl && (
                        <img src={t.photoDataUrl} alt={t.name}
                          className="h-12 w-12 rounded object-cover shrink-0 border border-amber-200" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-800 leading-tight">{t.name}</p>
                        {t.expiry && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Expires: {new Date(t.expiry).toLocaleDateString("en-AU", { month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
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
                          <span className="text-xs text-muted-foreground">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                          </span>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Available days */}
            {availableDays.length > 0 && (
              <section className="rounded-lg border bg-card p-5 card-shadow">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <Calendar size={16} /> Availability
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableDays.map((d) => (
                    <span key={d}
                      className="rounded-md bg-[#2E3192]/10 text-[#2E3192] border border-[#2E3192]/20 px-3 py-1 text-sm font-medium">
                      {d}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Insurance */}
            {insurance.length > 0 && (
              <section className="rounded-lg border bg-card p-5 card-shadow">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck size={16} /> Insurance Held
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insurance.map((ins) => (
                    <span key={ins}
                      className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-sm font-medium">
                      {ins}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Member since */}
            <section className="rounded-lg border bg-card p-5 card-shadow">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Calendar size={16} /> Member Since
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {contractor.createdAt
                  ? new Date(contractor.createdAt).toLocaleDateString("en-AU", { year: "numeric", month: "long" })
                  : "N/A"}
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
