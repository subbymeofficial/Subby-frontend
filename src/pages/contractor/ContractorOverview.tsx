import {
  LayoutDashboard, UserCog, CreditCard, FileCheck, Briefcase, Star, Settings, ShieldCheck, Calendar, DollarSign,
 Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  useMyApplications, useUserReviews, useSubscriptionStatus, useContractorEarnings,
} from "@/hooks/use-api";
import { Link } from "react-router-dom";
import type { Listing } from "@/lib/types";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";

const navItems = [
  { label: "Overview", path: "/dashboard/contractor", icon: LayoutDashboard },
  { label: "Edit Profile", path: "/dashboard/contractor/profile", icon: UserCog },
  { label: "Browse Jobs", path: "/dashboard/contractor/jobs", icon: Briefcase },
  { label: "My Applications", path: "/dashboard/contractor/applications", icon: FileCheck },
  { label: "Subscription", path: "/dashboard/contractor/subscription", icon: CreditCard },
  { label: "Reviews", path: "/dashboard/contractor/reviews", icon: Star },
  { label: "Availability", path: "/dashboard/contractor/availability", icon: Calendar },
  { label: "Settings", path: "/dashboard/contractor/settings", icon: Settings },
];

export default function ContractorOverview() {
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  const { data: applications, isLoading: appsLoading } = useMyApplications();
  const { data: reviewsData } = useUserReviews(userId);
  const { data: subStatus, isLoading: subLoading } = useSubscriptionStatus();
  const { data: earnings } = useContractorEarnings();
  const isLoading = appsLoading || subLoading;
  if (isLoading) return (
    <DashboardLayout title="Contractor Dashboard" navItems={navItems}>
      <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </DashboardLayout>
  );

  const pendingApps = applications?.filter((a) => a.status === "pending") ?? [];
  const acceptedApps = applications?.filter((a) => a.status === "accepted") ?? [];
  const subActive = subStatus?.status === "active" || subStatus?.status === "trialing";

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={navItems}>
      <ProfileCompletionBanner />

      {/* Subscription Banner */}
      {!subActive && (
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-yellow-600" size={22} />
            <div>
              <p className="font-semibold text-foreground">No Active Subscription</p>
              <p className="text-sm text-muted-foreground">Subscribe to apply for jobs and appear in search results.</p>
            </div>
          </div>
          <Link
            to="/dashboard/contractor/subscription"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {subActive && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/5 p-4 flex items-center gap-3">
          <ShieldCheck className="text-success" size={22} />
          <div>
            <p className="font-semibold text-foreground capitalize">{subStatus?.plan} Plan — Active</p>
            <p className="text-sm text-muted-foreground">
              {subStatus?.status === "trialing" ? "Founding member — free year active" : "Subscription active"}
              {subStatus?.expiresAt && ` · Renews ${new Date(subStatus.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Applications"
          value={applications?.length ?? 0}
          change={`${pendingApps.length} pending`}
          positive
          icon={FileCheck}
        />
        <StatsCard title="Accepted Jobs" value={acceptedApps.length} icon={Briefcase} />
        <StatsCard
          title="Rating"
          value={`${(reviewsData?.averageRating ?? 0).toFixed(1)} / 5`}
          change={`${reviewsData?.total ?? 0} reviews`}
          positive
          icon={Star}
        />
        <StatsCard
          title="Total Earned"
          value={`$${((earnings?.totalEarned ?? 0) / 100).toFixed(0)}`}
          change={earnings?.pendingEscrow ? `$${(earnings.pendingEscrow / 100).toFixed(0)} pending` : undefined}
          positive
          icon={DollarSign}
        />
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 card-shadow">
        <h2 className="font-semibold text-foreground">Welcome, {user?.name}</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <span className={`inline-block h-2 w-2 rounded-full ${user?.isActive ? "bg-success" : "bg-destructive"}`} />
          {user?.isActive ? "Available for work" : "Unavailable"}
          {user?.isVerified && <Badge variant="secondary" className="ml-2">Verified</Badge>}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse jobs, manage your applications, and track your earnings.
        </p>

        {pendingApps.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Applications</h3>
            {pendingApps.slice(0, 3).map((app) => {
              const listing = typeof app.listingId === "object" ? (app.listingId as Listing) : null;
              return (
                <div key={app._id} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <div>
                    <span className="text-sm font-medium text-foreground">{listing?.title || "Listing"}</span>
                    <p className="text-xs text-muted-foreground">{listing?.category || ""}</p>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">{app.status}</Badge>
                </div>
              );
            })}
            {pendingApps.length > 3 && (
              <Link to="/dashboard/contractor/applications" className="text-sm text-primary hover:underline">
                View all {pendingApps.length} pending applications
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export { navItems as contractorNavItems };
