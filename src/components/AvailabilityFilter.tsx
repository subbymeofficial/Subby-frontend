// SubbyMe's #1 differentiator — filter contractors by when they're actually free.
import { CalendarDays } from "lucide-react";

export type AvailabilityWindow = "today" | "tomorrow" | "this-week" | "this-month" | "any";

const OPTIONS: { value: AvailabilityWindow; label: string; hint: string }[] = [
  { value: "today", label: "Today", hint: "Ready right now" },
  { value: "tomorrow", label: "Tomorrow", hint: "Next 48 hours" },
  { value: "this-week", label: "This week", hint: "Next 7 days" },
  { value: "this-month", label: "This month", hint: "Next 30 days" },
  { value: "any", label: "Any time", hint: "No filter" },
];

interface Props {
  value: AvailabilityWindow;
  onChange: (v: AvailabilityWindow) => void;
}

export function AvailabilityFilter({ value, onChange }: Props) {
  return (
    <section aria-labelledby="availability-label" className="space-y-2">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[#0D6EFD]" aria-hidden />
        <h3 id="availability-label" className="text-sm font-semibold text-[#0B1E3C]">Availability</h3>
      </div>
      <div role="radiogroup" aria-labelledby="availability-label" className="flex flex-wrap gap-1.5">
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button key={opt.value} type="button" role="radio" aria-checked={active}
              onClick={() => onChange(opt.value)} title={opt.hint}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-[#0D6EFD] bg-[#0D6EFD] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}>
              {opt.label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">Only show contractors with open slots in your selected window.</p>
    </section>
  );
}
