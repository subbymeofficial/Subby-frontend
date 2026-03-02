import {
  Users, FolderTree, ShieldCheck, CreditCard, Tag, BarChart3, Loader2,
  FileText, DollarSign, Star, Briefcase, Settings,
} from "lucide-react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StatsCard } from "@/components/StatsCard";
import { useAdminStats } from "@/hooks/use-api";
import type { AdminStats } from "@/services/admin.service";

const navItems = [
  { label: "Overview", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Jobs", path: "/admin/jobs", icon: Briefcase },
  { label: "Applications", path: "/admin/applications", icon: FileText },
  { label: "Verifications", path: "/admin/verifications", icon: ShieldCheck },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
  { label: "Promo Codes", path: "/admin/promo-codes", icon: Tag },
  { label: "Payments", path: "/admin/payments", icon: DollarSign },
  { label: "Reviews", path: "/admin/reviews", icon: Star },
  { label: "Categories", path: "/admin/categories", icon: FolderTree },
  { label: "Trades", path: "/admin/trades", icon: Tag },
  { label: "Settings", path: "/admin/settings", icon: Settings },
];

export default function AdminOverview() {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const { data: stats, isLoading } = useAdminStats({
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <AdminLayout navItems={navItems}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-xl font-semibold text-foreground">Admin Overview</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Date range:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Primary Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Users" value={stats?.users.total ?? 0} icon={Users} />
            <StatsCard title="Clients" value={stats?.users.client ?? 0} icon={Users} />
            <StatsCard title="Contractors" value={stats?.users.contractor ?? 0} icon={ShieldCheck} />
            <StatsCard title="Total Jobs" value={stats?.listings.total ?? 0} icon={Briefcase} />
          </div>

          {/* Secondary Stats */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Active Subscriptions"
              value={stats?.subscriptions.total ?? 0}
              change={`${stats?.subscriptions.trialing ?? 0} trialing`}
              positive
              icon={CreditCard}
            />
            <StatsCard
              title="Total Applications"
              value={stats?.applications.total ?? 0}
              icon={FileText}
            />
            <StatsCard
              title="Revenue"
              value={`$${((stats?.revenue.total ?? 0) / 100).toFixed(0)}`}
              change={`${stats?.revenue.transactionCount ?? 0} transactions`}
              positive
              icon={DollarSign}
            />
            <StatsCard title="Reviews" value={stats?.reviews.total ?? 0} icon={Star} />
          </div>

          {/* Detail Panels */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Listings by Status */}
            <div className="rounded-lg border bg-card p-6 card-shadow">
              <h3 className="font-semibold text-foreground">Jobs by Status</h3>
              <div className="mt-4 space-y-2">
                {stats?.listings.byStatus && Object.entries(stats.listings.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                    <span className="capitalize text-foreground">{status.replace("_", " ")}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
                {(!stats?.listings.byStatus || Object.keys(stats.listings.byStatus).length === 0) && (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </div>
            </div>

            {/* Applications by Status */}
            <div className="rounded-lg border bg-card p-6 card-shadow">
              <h3 className="font-semibold text-foreground">Applications by Status</h3>
              <div className="mt-4 space-y-2">
                {stats?.applications.byStatus && Object.entries(stats.applications.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                    <span className="capitalize text-foreground">{status}</span>
                    <span className="font-semibold text-foreground">{count}</span>
                  </div>
                ))}
                {(!stats?.applications.byStatus || Object.keys(stats.applications.byStatus).length === 0) && (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                )}
              </div>
            </div>

            {/* User Distribution */}
            <div className="rounded-lg border bg-card p-6 card-shadow">
              <h3 className="font-semibold text-foreground">User Distribution</h3>
              <div className="mt-4 space-y-2">
                {(["client", "contractor", "admin"] as const).map((role) => (
                  <div key={role} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                    <span className="capitalize text-foreground">{role}s</span>
                    <span className="font-semibold text-foreground">{stats?.users[role] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue by Month */}
            <div className="rounded-lg border bg-card p-6 card-shadow lg:col-span-1">
              <h3 className="font-semibold text-foreground">Revenue by Month</h3>
              <div className="mt-4 space-y-2">
                {stats?.revenue.byMonth && stats.revenue.byMonth.length > 0 ? (
                  stats.revenue.byMonth.map((m) => (
                    <div key={m.month} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                      <span className="text-foreground">{m.month}</span>
                      <span className="font-semibold text-foreground">
                        ${(m.total / 100).toFixed(0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No revenue data.</p>
                )}
              </div>
            </div>

            {/* Jobs by Category */}
            <div className="rounded-lg border bg-card p-6 card-shadow lg:col-span-2">
              <h3 className="font-semibold text-foreground">Jobs by Category</h3>
              <div className="mt-4 space-y-2">
                {stats?.jobsByCategory && stats.jobsByCategory.length > 0 ? (
                  stats.jobsByCategory.map((c) => (
                    <div key={c.category} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                      <span className="text-foreground">{c.category || "Uncategorized"}</span>
                      <span className="font-semibold text-foreground">{c.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No category data.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export { navItems as adminNavItems };
