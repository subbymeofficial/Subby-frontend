import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { contractorNavItems } from "./ContractorOverview";
import { useSubscriptionStatus, useCreateSubscription, useUpgradeQualification, useMyTransactions } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { PromoCodeApply } from "@/components/PromoCodeApply";
import type { ValidatePromoResult } from "@/services/payments.service";

export default function ContractorSubscription() {
  const { data: subStatus, isLoading } = useSubscriptionStatus();
  const { data: transactions } = useMyTransactions();
  const subscribe = useCreateSubscription();
  const upgrade = useUpgradeQualification();
  const { toast } = useToast();
  const [appliedPromoStandard, setAppliedPromoStandard] = useState<ValidatePromoResult | null>(null);
  const [appliedPromoPremium, setAppliedPromoPremium] = useState<ValidatePromoResult | null>(null);

  const currentPlan = subStatus?.plan;
  const subActive = subStatus?.status === "active" || subStatus?.status === "trialing";

  const handleSubscribe = async (plan: "standard" | "premium") => {
    try {
      const promo = plan === "standard" ? appliedPromoStandard : appliedPromoPremium;
      const { url } = await subscribe.mutateAsync({ plan, promoCodeId: promo?.valid ? promo.promoCodeId : undefined });
      window.location.href = url;
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await upgrade.mutateAsync();
      window.location.href = url;
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      {/* Status Banner */}
      {subActive && (
        <div className="mb-6 rounded-lg border border-success/30 bg-success/5 p-4 flex items-center gap-3">
          <ShieldCheck className="text-success" size={24} />
          <div>
            <p className="font-semibold text-foreground capitalize">{currentPlan} Plan — Active</p>
            <p className="text-sm text-muted-foreground">
              {subStatus?.status === "trialing" ? "Free trial active" : "Subscription active"}
              {subStatus?.expiresAt && ` · Renews ${new Date(subStatus.expiresAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
      )}

      <h2 className="mb-6 text-lg font-semibold text-foreground">Subscription Plans</h2>
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl">
        {/* Standard */}
        <div className={`rounded-lg bg-card p-6 card-shadow relative ${currentPlan === "standard" ? "border-2 border-primary" : "border"}`}>
          {currentPlan === "standard" && (
            <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Current Plan</span>
          )}
          <h3 className="text-xl font-bold text-foreground">Standard</h3>
          <p className="mt-1 text-3xl font-bold text-primary">$10<span className="text-base font-normal text-muted-foreground">/week</span></p>
          <p className="mt-1 text-xs text-muted-foreground">First year free — founding member!</p>
          <ul className="mt-4 space-y-2">
            {["Profile listing", "Up to 20 messages/month", "Basic analytics", "Search visibility"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-success" />{f}
              </li>
            ))}
          </ul>
          {currentPlan !== "standard" && (
            <div className="mt-4">
              <PromoCodeApply
                plan="standard"
                appliedResult={appliedPromoStandard}
                onApplied={setAppliedPromoStandard}
                onRemove={() => setAppliedPromoStandard(null)}
              />
            </div>
          )}
          {currentPlan === "standard" ? (
            <Button variant="outline" className="mt-6 w-full" disabled type="button">Current Plan</Button>
          ) : (
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => handleSubscribe("standard")}
              disabled={subscribe.isPending}
            >
              {subscribe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {subActive ? "Switch to Standard" : appliedPromoStandard?.valid ? `Subscribe — $${((appliedPromoStandard.discountedAmount ?? 1000) / 100).toFixed(2)}/week` : "Subscribe — $10/week"}
            </Button>
          )}
        </div>

        {/* Premium */}
        <div className={`rounded-lg bg-card p-6 card-shadow relative ${currentPlan === "premium" ? "border-2 border-primary" : "border"}`}>
          {currentPlan === "premium" && (
            <span className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">Current Plan</span>
          )}
          <h3 className="text-xl font-bold text-foreground">Premium</h3>
          <p className="mt-1 text-3xl font-bold text-foreground">$25<span className="text-base font-normal text-muted-foreground">/week</span></p>
          <p className="mt-1 text-xs text-muted-foreground">First year free — founding member!</p>
          <ul className="mt-4 space-y-2">
            {["Everything in Standard", "Unlimited messages", "Priority search placement", "Featured badge", "Advanced analytics"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-success" />{f}
              </li>
            ))}
          </ul>
          {currentPlan !== "premium" && (
            <div className="mt-4">
              <PromoCodeApply
                plan="premium"
                appliedResult={appliedPromoPremium}
                onApplied={setAppliedPromoPremium}
                onRemove={() => setAppliedPromoPremium(null)}
              />
            </div>
          )}
          {currentPlan === "premium" ? (
            <Button variant="outline" className="mt-6 w-full" disabled type="button">Current Plan</Button>
          ) : (
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => handleSubscribe("premium")}
              disabled={subscribe.isPending}
            >
              {subscribe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentPlan === "standard" ? "Upgrade to Premium" : appliedPromoPremium?.valid ? `Subscribe — $${((appliedPromoPremium.discountedAmount ?? 2500) / 100).toFixed(2)}/week` : "Subscribe — $25/week"}
            </Button>
          )}
        </div>
      </div>

      {/* Qualification Upgrade */}
      <div className="mt-8 max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Verified Qualification Badge</h2>
        <div className="rounded-lg border bg-card p-6 card-shadow">
          <div className="flex items-start gap-4">
            <ShieldCheck className="text-primary mt-0.5" size={28} />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Get Verified</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stand out with a Verified Qualification badge. Boost your credibility and rank higher in search results.
              </p>
              <p className="mt-2 text-2xl font-bold text-foreground">$20<span className="text-sm font-normal text-muted-foreground">/week</span></p>
            </div>
            {subStatus?.hasQualificationUpgrade ? (
              <Badge className="mt-1">Active</Badge>
            ) : (
              <Button type="button" onClick={handleUpgrade} disabled={upgrade.isPending}>
                {upgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription History */}
      <div className="mt-8 max-w-3xl">
        <h2 className="mb-4 text-lg font-semibold text-foreground flex items-center gap-2">
          <CreditCard size={18} /> Subscription History
        </h2>
        <div className="overflow-x-auto rounded-lg border bg-card card-shadow">
          {(() => {
            const subHistory = (transactions ?? []).filter(
              (tx) => tx.type === "subscription" || tx.type === "qualification_upgrade"
            );
            if (subHistory.length === 0) {
              return (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No subscription payments yet. Your subscription and qualification upgrade payments will appear here.
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
                      <td className="p-3 text-foreground capitalize">{tx.type.replace("_", " ")}</td>
                      <td className="p-3 text-foreground">${(tx.amount / 100).toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={tx.status === "completed" || tx.status === "released" ? "default" : tx.status === "escrow" ? "secondary" : "outline"} className="capitalize">
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
