import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { contractorNavItems } from "./ContractorOverview";
import { useContractorEarnings, useMyTransactions } from "@/hooks/use-api";
import { Loader2, DollarSign, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";

export default function ContractorEarnings() {
  const { data: earnings, isLoading: earningsLoading, isError: earningsError } = useContractorEarnings();
  const { data: allTx, isLoading: txLoading, isError: txError } = useMyTransactions();

  const isLoading = earningsLoading || txLoading;
  const isError = earningsError || txError;
  const jobTx = earnings?.transactions ?? [];
  const subTx = allTx?.filter((t) => t.type === "subscription" || t.type === "qualification_upgrade") ?? [];

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      <h2 className="mb-6 text-lg font-semibold text-foreground">Earnings & Payments</h2>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-2 font-medium text-destructive">Failed to load earnings</p>
          <p className="mt-1 text-sm text-muted-foreground">Please refresh the page and try again.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <StatsCard
              title="Total Earned"
              value={`$${((earnings?.totalEarned ?? 0) / 100).toFixed(2)}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Pending Escrow"
              value={`$${((earnings?.pendingEscrow ?? 0) / 100).toFixed(2)}`}
              change="Awaiting release by client"
              icon={Clock}
            />
            <StatsCard
              title="Job Payments"
              value={jobTx.length}
              icon={TrendingUp}
            />
          </div>

          {/* Job Payments */}
          <h3 className="mb-3 font-semibold text-foreground">Job Payment History</h3>
          {jobTx.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center card-shadow mb-8">
              <p className="text-muted-foreground">No job payments received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-card card-shadow mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary">
                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Job</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Client</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobTx.map((tx) => {
                    const listing = typeof tx.listingId === "object" ? tx.listingId : null;
                    const client = typeof tx.userId === "string" ? null : tx.userId;
                    return (
                      <tr key={tx._id} className="border-b last:border-0">
                        <td className="p-3 text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-foreground">
                          {listing && typeof listing === "object" && "title" in listing ? (listing as { title: string }).title : "Job"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {client && typeof client === "object" && "name" in client ? (client as { name: string }).name : "—"}
                        </td>
                        <td className="p-3 text-right font-medium text-foreground">${(tx.amount / 100).toFixed(2)}</td>
                        <td className="p-3">
                          <Badge
                            variant={tx.status === "released" ? "default" : tx.status === "escrow" ? "secondary" : "outline"}
                            className="capitalize"
                          >
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Subscription Payments */}
          <h3 className="mb-3 font-semibold text-foreground">Subscription & Upgrade Payments</h3>
          {subTx.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center card-shadow">
              <p className="text-muted-foreground">No subscription payments yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border bg-card card-shadow">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary">
                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">Amount</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subTx.map((tx) => (
                    <tr key={tx._id} className="border-b last:border-0">
                      <td className="p-3 text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-foreground capitalize">{tx.type.replace("_", " ")}</td>
                      <td className="p-3 text-right font-medium text-foreground">${(tx.amount / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={tx.status === "completed" ? "default" : "outline"} className="capitalize">{tx.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
