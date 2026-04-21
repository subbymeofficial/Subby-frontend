import { useMemo } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { AvailabilityFilter } from "./AvailabilityFilter";
import { LocationSelect } from "./LocationSelect";
import { TRADE_CATEGORIES } from "@/data/trades";

export interface Filters {
  location: string;
  category: string;
  subtrade: string;
  minRating: string;
  minHourlyRate: string;
  maxHourlyRate: string;
  verified: boolean;
  available: boolean;
}

interface FilterSidebarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function FilterSidebar({ filters, onChange, mobileOpen, onClose }: FilterSidebarProps) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const clear = () =>
    onChange({
      location: "",
      category: "",
      subtrade: "",
      minRating: "",
      minHourlyRate: "",
      maxHourlyRate: "",
      verified: false,
      available: false,
    });

  // Find the selected category's subtrades from the static list
  const selectedCategory = useMemo(
    () => TRADE_CATEGORIES.find((c) => c.name === filters.category),
    [filters.category]
  );

  const content = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal size={18} /> Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground text-xs">
          Clear all
        </Button>
      </div>

      {/* Location */}
      <LocationSelect
        label="Location"
        value={filters.location}
        onChange={(formatted) => update("location", formatted)}
        stacked
      />

      {/* Trade Category */}
      <div className="space-y-1.5">
        <Label>Trade Category</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(v) => {
            update("category", v === "all" ? "" : v);
            update("subtrade", ""); // reset subtrade when category changes
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">All Categories</SelectItem>
            {TRADE_CATEGORIES.map((c) => (
              <SelectItem key={c.slug} value={c.name}>
                {c.name}
                <span className="ml-1 text-xs text-muted-foreground">({c.count})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subtrade — only shown when a category is selected */}
      {selectedCategory && selectedCategory.trades.length > 0 && (
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1">
            <ChevronRight size={13} className="text-primary" />
            Specific Trade
          </Label>
          <Select
            value={filters.subtrade || "all"}
            onValueChange={(v) => update("subtrade", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`All ${selectedCategory.name}`} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all">All {selectedCategory.name}</SelectItem>
              {selectedCategory.trades.map((t) => (
                <SelectItem key={t.slug} value={t.name}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Min Rating */}
      <div className="space-y-1.5">
        <Label>Minimum Rating</Label>
        <Select
          value={filters.minRating || "any"}
          onValueChange={(v) => update("minRating", v === "any" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rate range */}
      <div className="space-y-1.5">
        <Label>Hourly Rate ($/hr)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minHourlyRate}
            onChange={(e) => update("minHourlyRate", e.target.value)}
            min="0"
            step="5"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxHourlyRate}
            onChange={(e) => update("maxHourlyRate", e.target.value)}
            min="0"
            step="5"
          />
        </div>
      </div>

      {/* Verified */}
      <div className="flex items-center justify-between">
        <Label>Verified Only</Label>
        <Switch checked={filters.verified} onCheckedChange={(v) => update("verified", v)} />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 shrink-0 rounded-lg border bg-card p-5 card-shadow h-fit sticky top-24">
        <AvailabilityFilter />
        <div className="mt-5">{content}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-80 bg-card p-5 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={20} />
              </Button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
