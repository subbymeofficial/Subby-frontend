import { LayoutDashboard, Briefcase, Heart, Star, Settings, FileText, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { useMyListings, useSavedContractors, useMyTransactions } from "@/hooks/use-api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export const clientNavItems = [
  { label: "Overview", path: "/dashboard/client", icon: LayoutDashboard },
  { label: "Subscription", path: "/dashboard/client/subscription", icon: CreditCard },
  { label: "My Listings", path: "/dashboard/client/listings", icon: Briefcase },
  { label: "Applications", path: "/dashboard/client/applications", icon: FileText },
  { label: "Saved Contractors", path: "/dashboard/client/saved", icon: Heart },
  { label: "My Reviews", path: "/dashboard/client/reviews", icon: Star },
  { label: "Settings", path: "/dashboard/client/settings", icon: Settings },
];

export default function ClientOverview() {
  const { user } = useAuth();
  const { data: listings } = useMyListings();
  const { data: saved } = useSavedContractors();
  const { data: transactions } = useMyTransactions();

  const activeListings = listings?.filter(l => l.status === "open" || l.status === "in_progress") ?? [];
  const completedListings = listings?.filter(l => l.status === "completed") ?? [];
  const totalApps = listings?.reduce((sum, l) => sum + l.applicationCount, 0) ?? 0;
  const escrowPayments = transactions?.filter(t => t.status === "escrow") ?? [];

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Active Jobs" value={activeListings.length} icon={Briefcase} />
        <StatsCard title="Total Applications" value={totalApps} icon={FileText} />
        <StatsCard title="Saved Contractors" value={saved?.length ?? 0} icon={Heart} />
        <StatsCard title="Completed Jobs" value={completedListings.length} icon={Star} />
      </div>

      {/* Escrow Pending */}
      {escrowPayments.length > 0 && (
        <div className="mt-6 rounded-lg border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10 p-4">
          <h3 className="font-semibold text-foreground">Payments in Escrow</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You have {escrowPayments.length} payment(s) held in escrow.{" "}
            <Link to="/dashboard/client/payments" className="text-primary underline">View payments</Link>
          </p>
        </div>
      )}

      <div className="mt-8 rounded-lg border bg-card p-6 card-shadow">
        <h2 className="font-semibold text-foreground">Welcome, {user?.name}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your job listings, review applications, and find the right contractors for your projects.
        </p>
        {activeListings.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Active Listings</h3>
            {activeListings.slice(0, 5).map((listing) => (
              <div key={listing._id} className="flex items-center gap-3 rounded-lg bg-secondary p-3 text-sm">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="font-medium text-foreground flex-1">{listing.title}</span>
                <Badge variant="outline" className="capitalize text-xs">{listing.status.replace("_", " ")}</Badge>
                <span className="text-xs text-muted-foreground">{listing.applicationCount} apps</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
