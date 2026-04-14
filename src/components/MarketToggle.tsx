// Header toggle: switches between AU and US market context.
import { useMarket } from "@/context/MarketContext";

export function MarketToggle({ compact = false }: { compact?: boolean }) {
  const { market, setMarket } = useMarket();
  return (
    <div role="group" aria-label="Select market" className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-sm shadow-sm">
      <button type="button" onClick={() => setMarket("AU")} aria-pressed={market.code === "AU"}
        className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition ${market.code === "AU" ? "bg-[#0D6EFD] text-white" : "text-slate-600 hover:text-slate-900"}`}>
        <span aria-hidden>🇦🇺</span>{!compact && <span>AU</span>}
      </button>
      <button type="button" onClick={() => setMarket("US")} aria-pressed={market.code === "US"}
        className={`flex items-center gap-1 rounded-full px-3 py-1 font-medium transition ${market.code === "US" ? "bg-[#0D6EFD] text-white" : "text-slate-600 hover:text-slate-900"}`}>
        <span aria-hidden>🇺🇸</span>{!compact && <span>US</span>}
      </button>
    </div>
  );
}
