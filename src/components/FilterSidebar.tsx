import { useCategories } from "@/hooks/use-api";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  location: string;
  category: string;
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
  const { data: categories } = useCategories();
  const update = (key: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [key]: value });
  };

  const clear = () => onChange({ location: "", category: "", minRating: "", minHourlyRate: "", maxHourlyRate: "", verified: false, available: false });

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <SlidersHorizontal size={18} /> Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">Clear</Button>
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        <Input placeholder="e.g. Sydney, NSW" value={filters.location} onChange={(e) => update("location", e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label>Trade Category</Label>
        <Select value={filters.category} onValueChange={(v) => update("category", v)}>
          <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {(categories ?? []).map((c) => (
              <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Minimum Rating</Label>
        <Select value={filters.minRating} onValueChange={(v) => update("minRating", v)}>
          <SelectTrigger><SelectValue placeholder="Any Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Rating</SelectItem>
            <SelectItem value="4">4+ Stars</SelectItem>
            <SelectItem value="4.5">4.5+ Stars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Hourly Rate Range ($/hr)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input 
              type="number" 
              placeholder="Min" 
              value={filters.minHourlyRate} 
              onChange={(e) => update("minHourlyRate", e.target.value)}
              min="0"
              step="5"
            />
          </div>
          <div>
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
      </div>

      <div className="flex items-center justify-between">
        <Label>Verified Only</Label>
        <Switch checked={filters.verified} onCheckedChange={(v) => update("verified", v)} />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-72 shrink-0 rounded-lg border bg-card p-5 card-shadow h-fit sticky top-24">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-80 bg-card p-5 overflow-y-auto">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="icon" onClick={onClose}><X size={20} /></Button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
