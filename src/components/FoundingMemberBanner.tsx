// Sticky or inline banner showing first-500 founding member spots.
import { Sparkles } from "lucide-react";
import { useMarket } from "@/context/MarketContext";

interface Props {
  spotsRemaining?: number;
  spotsTotal?: number;
  variant?: "sticky" | "inline";
}

export function FoundingMemberBanner({
  spotsRemaining = 487,
  spotsTotal = 500,
  variant = "inline",
}: Props) {
  const { market } = useMarket();
  const pct = Math.round(((spotsTotal - spotsRemaining) / spotsTotal) * 100);
  const monthly = market.currencySymbol + market.priceMonthly;

  const content = (
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-white">
        <Sparkles className="h-4 w-4" aria-hidden />
        <span className="font-semibold">Founding Member — free forever</span>
        <span className="hidden text-white/80 sm:inline">
          · First 500 contractors never pay. Normally {monthly}/mo.
        </span>
      </div>
      <div className="flex items-center gap-3 text-white">
        <div className="hidden w-40 overflow-hidden rounded-full bg-white/20 sm:block">
          <div className="h-1.5 rounded-full bg-white" style={{ width: `${pct}%` }} aria-hidden />
        </div>
        <span className="font-medium">{spotsRemaining} of {spotsTotal} spots left</span>
      </div>
    </div>
  );

  if (variant === "sticky") {
    return <div className="sticky top-0 z-40 bg-[#16A34A]">{content}</div>;
  }
  return <div className="bg-[#16A34A]">{content}</div>;
}
