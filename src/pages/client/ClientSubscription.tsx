import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { clientNavItems } from "./ClientOverview";
import { useSubscriptionStatus, useCreateClientSubscription, useMyTransactions } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function ClientSubscription() {
  const { data: subStatus, isLoading } = useSubscriptionStatus();
  const { data: transactions } = useMyTransactions();
  const subscribe = useCreateClientSubscription();
  const { toast } = useToast();

  const subActive = subStatus?.status === "active" || subStatus?.status === "trialing";
  const hasClientPlan = subStatus?.plan === "client";

  const handleSubscribe = async () => {
    try {
      const { url } = await subscribe.mutateAsync();
      window.location.href = url;
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      {subActive && hasClientPlan && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/5 p-4 flex items-center gap-3">
          <ShieldCheck className="text-success" size={24} />
          <div>
            <p className="font-semibold text-foreground">Client Plan — Active</p>
            <p className="text-sm text-muted-foreground">
              {subStatus?.status === "trialing" ? "Free trial active" : "Subscription active"}
              {subStatus?.expiresAt && ` · Renews ${new Date(subStatus.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      <h2 className="mb-6 text-lg font-semibold text-foreground">Subscription</h2>
      <div className="max-w-md">
        <div className={`rounded-lg bg-card p-6 card-shadow border ${hasClientPlan ? "border-2 border-primary" : ""}`}>
          {hasClientPlan && (
            <span className="inline-block rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground mb-4">Current Plan</span>
          )}
          <h3 className="text-xl font-bold text-foreground">Client Plan</h3>
          <p className="mt-1 text-3xl font-bold text-primary">$10<span className="text-base font-normal text-muted-foreground">/week</span></p>
          <p className="mt-2 text-sm text-muted-foreground">Post jobs and hire verified contractors.</p>
          <ul className="mt-4 space-y-2">
            {["Post job listings", "Receive contractor applications", "Pay for completed jobs (escrow)", "Message contractors", "Leave reviews"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-success shrink-0" />{f}
              </li>
            ))}
          </ul>
          {hasClientPlan ? (
            <Button variant="outline" className="mt-6 w-full" disabled type="button">Current Plan</Button>
          ) : (
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={handleSubscribe}
              disabled={subscribe.isPending}
            >
              {subscribe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subscribe — $10/week
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard size={18} /> Subscription History
        </h2>
        <div className="overflow-x-auto rounded-lg border bg-card card-shadow">
          {(() => {
            const subHistory = (transactions ?? []).filter((tx) => tx.type === "subscription");
            if (subHistory.length === 0) {
              return (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No subscription payments yet.
                </div>
              );
            }
            return (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary">
                    <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subHistory.map((tx) => (
                    <tr key={tx._id} className="border-b last:border-0">
                      <td className="p-3 text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-foreground capitalize">Subscription</td>
                      <td className="p-3 text-foreground">${(tx.amount / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={tx.status === "completed" ? "default" : "outline"} className="capitalize">
                          {tx.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
}
