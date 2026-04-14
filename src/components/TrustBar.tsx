// Thin trust strip beneath the hero.
import { ShieldCheck, CalendarCheck, CircleDollarSign, Zap } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Verified ABN / EIN" },
  { icon: CalendarCheck, label: "Real-time availability" },
  { icon: CircleDollarSign, label: "No booking fees" },
  { icon: Zap, label: "Direct contact — no middlemen" },
];

export function TrustBar() {
  return (
    <div className="border-y border-slate-200 bg-[#E7F1FF]/50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-around gap-4 px-4 py-3 text-sm text-[#0B1E3C]">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-[#16A34A]" aria-hidden />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
