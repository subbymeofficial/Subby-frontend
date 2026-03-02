import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Loader2, Check, X } from "lucide-react";
import { useValidatePromo } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import type { ValidatePromoResult } from "@/services/payments.service";

type Plan = "standard" | "premium";

const PLAN_LABELS: Record<Plan, string> = { standard: "Standard", premium: "Premium" };
const PLAN_PRICES: Record<Plan, number> = { standard: 1000, premium: 2500 };

type Props = {
  plan: Plan;
  onApplied: (result: ValidatePromoResult) => void;
  onRemove: () => void;
  appliedResult: ValidatePromoResult | null;
};

export function PromoCodeApply({ plan, onApplied, onRemove, appliedResult }: Props) {
  const [code, setCode] = useState("");
  const validatePromo = useValidatePromo();
  const { toast } = useToast();

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      const result = await validatePromo.mutateAsync({ code: trimmed, plan });
      if (result.valid) {
        onApplied(result);
        toast({
          title: "Promo applied!",
          description: `${result.code} — ${result.discountType === "percentage" ? `${result.discountValue}% off` : `${(result.extraTrialDays ?? 0) / 7} weeks free`}`,
        });
      } else {
        toast({ title: "Invalid code", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <motion.div
      className="rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md"
      initial={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
        <Tag size={16} />
        Apply Promo Code for {PLAN_LABELS[plan]}
      </div>

      {appliedResult?.valid ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 p-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-success">
              <Check size={18} />
              <span className="font-medium">{appliedResult.code} applied</span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <X size={16} />
            </Button>
          </div>
          <div className="mt-2 space-y-1 text-sm">
            {appliedResult.originalAmount !== appliedResult.discountedAmount && (
              <>
                <p className="text-muted-foreground">
                  <span className="line-through">{formatPrice(appliedResult.originalAmount)}</span>
                  <span className="ml-2 text-destructive">-{formatPrice(appliedResult.discountAmount)}</span>
                </p>
                <p className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  {formatPrice(appliedResult.discountedAmount)} /week
                </p>
              </>
            )}
            {appliedResult.extraTrialDays && appliedResult.extraTrialDays > 0 && (
              <p className="text-primary font-medium">+{appliedResult.extraTrialDays / 7} weeks free trial</p>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. SUBBY10"
            className="uppercase flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={handleApply}
            disabled={!code.trim() || validatePromo.isPending}
          >
            {validatePromo.isPending ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
