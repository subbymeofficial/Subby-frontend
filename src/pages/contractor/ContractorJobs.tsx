import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AppPagination } from "@/components/AppPagination";
import { contractorNavItems } from "./ContractorOverview";
import {
  useListings, useCategories, useCreateApplication, useSubscriptionStatus, useMyAvailability,
} from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, MapPin, Loader2, DollarSign, Clock, ChevronDown, ChevronUp, Send, AlertTriangle, CalendarIcon,
} from "lucide-react";
import type { Listing } from "@/lib/types";
import type { DateRange } from "react-day-picker";

const PAGE_SIZE = 8;

export default function ContractorJobs() {
  const { toast } = useToast();
  const { data: subStatus } = useSubscriptionStatus();
  const { data: availability } = useMyAvailability();
  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];
  const subActive = subStatus?.status === "active" || subStatus?.status === "trialing";

  const unavailableDates = availability?.unavailableDates || [];
  
  const isDateUnavailable = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const isUnavail = unavailableDates.includes(dateStr);
    return isUnavail;
  };

  console.log("Unavailable dates:", unavailableDates);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListings({
    search: search || undefined,
    category: category || undefined,
    location: location || undefined,
    status: "open",
    page,
    limit: PAGE_SIZE,
  });

  const listings = data?.listings ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Debug: Log listing IDs
  console.log("Fetched listings:", listings.map(l => ({ id: l._id, title: l.title, idLength: l._id?.length })));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyForm, setApplyForm] = useState({ coverLetter: "", proposedRate: "", proposedTimeline: "" });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const createApp = useCreateApplication();

  // Check if selected range contains unavailable dates
  const checkUnavailableInRange = () => {
    if (!dateRange?.from) return null;
    
    const unavailableInRange = [];
    
    if (dateRange.to) {
      // Date range selected
      const start = new Date(dateRange.from);
      const end = new Date(dateRange.to);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isDateUnavailable(new Date(d))) {
          unavailableInRange.push(format(new Date(d), "MMM dd"));
        }
      }
    } else {
      // Single date selected
      if (isDateUnavailable(dateRange.from)) {
        unavailableInRange.push(format(dateRange.from, "MMM dd"));
      }
    }
    
    return unavailableInRange.length > 0 ? unavailableInRange : null;
  };

  const handleApply = async (listingId: string) => {
    if (!subActive) {
      toast({
        title: "Subscription Required",
        description: "You need an active subscription to apply for jobs.",
        variant: "destructive",
      });
      return;
    }
    
    // Normalize and validate listing ID
    const normalizedId = (listingId || '').toString().trim();
    if (!normalizedId || normalizedId.length !== 24 || !/^[a-f0-9]{24}$/i.test(normalizedId)) {
      console.error("Invalid listing ID:", listingId);
      toast({
        title: "Error",
        description: "Invalid job listing ID. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate that no unavailable dates are in the selected range
    // Check if user selected any dates
    if (dateRange?.from) {
      const hasUnavailableDates = [];
      
      console.log("Validating date range:", { from: dateRange.from, to: dateRange.to });
      
      // If there's a date range (from and to)
      if (dateRange.to) {
        const start = new Date(dateRange.from);
        const end = new Date(dateRange.to);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const currentDate = new Date(d);
          const isUnavail = isDateUnavailable(currentDate);
          console.log(`Checking date ${format(currentDate, "yyyy-MM-dd")}: unavailable = ${isUnavail}`);
          if (isUnavail) {
            hasUnavailableDates.push(format(currentDate, "MMM dd, yyyy"));
          }
        }
      } else {
        // If only a single date is selected, check that date
        const isUnavail = isDateUnavailable(dateRange.from);
        console.log(`Checking single date ${format(dateRange.from, "yyyy-MM-dd")}: unavailable = ${isUnavail}`);
        if (isUnavail) {
          hasUnavailableDates.push(format(dateRange.from, "MMM dd, yyyy"));
        }
      }
      
      console.log("Unavailable dates found in selection:", hasUnavailableDates);
      
      if (hasUnavailableDates.length > 0) {
        toast({
          title: "Cannot Apply",
          description: `Your selected timeline includes unavailable dates: ${hasUnavailableDates.join(", ")}. Please choose different dates.`,
          variant: "destructive",
        });
        return;
      }
    }
    
    let timelineText = applyForm.proposedTimeline;
    if (dateRange?.from && dateRange?.to) {
      timelineText = `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    } else if (dateRange?.from) {
      timelineText = `Starting ${format(dateRange.from, "MMM dd, yyyy")}`;
    }
    
    try {
      console.log("Submitting application with data:", {
        listingId: normalizedId,
        coverLetter: applyForm.coverLetter,
        proposedRate: applyForm.proposedRate ? Number(applyForm.proposedRate) : undefined,
        proposedTimeline: timelineText || undefined,
      });
      
      await createApp.mutateAsync({
        listingId: normalizedId,
        coverLetter: applyForm.coverLetter,
        proposedRate: applyForm.proposedRate ? Number(applyForm.proposedRate) : undefined,
        proposedTimeline: timelineText || undefined,
      });
      toast({ title: "Applied!", description: "Your application has been submitted." });
      setExpandedId(null);
      setApplyForm({ coverLetter: "", proposedRate: "", proposedTimeline: "" });
      setDateRange(undefined);
    } catch (error) {
      console.error("Application error:", error);
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const urgencyColor: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      {!subActive && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-900/10 p-4">
          <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Subscription required.</span> You must have an active subscription to apply for jobs.
          </p>
        </div>
      )}

      <h2 className="mb-4 text-lg font-semibold text-foreground">Browse Available Jobs</h2>

      {/* Search & Filters */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by location..."
            className="pl-9"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-lg font-medium text-muted-foreground">No open jobs found.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing: Listing) => {
            const isExpanded = expandedId === listing._id;
            return (
              <div key={listing._id} className="rounded-lg border bg-card card-shadow overflow-hidden">
                <div
                  className="flex items-start justify-between gap-4 p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : listing._id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{listing.title}</h3>
                      <Badge variant="secondary">{listing.category}</Badge>
                      {listing.urgency && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${urgencyColor[listing.urgency] || ""}`}>
                          {listing.urgency}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin size={14} />{listing.location}</span>
                      {listing.budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          ${listing.budget.min} – ${listing.budget.max}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
                    {listing.skills && listing.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {listing.skills.map((s) => (
                          <span key={s} className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{listing.applicationCount} apps</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-secondary/20 p-4">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Apply to this Job</h4>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Cover Letter *</Label>
                        <Textarea
                          rows={3}
                          placeholder="Why are you a good fit for this job?"
                          value={applyForm.coverLetter}
                          onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Proposed Rate ($/hr)</Label>
                          <Input
                            type="number"
                            placeholder="e.g. 50"
                            value={applyForm.proposedRate}
                            onChange={(e) => setApplyForm({ ...applyForm, proposedRate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Timeline</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !dateRange && !applyForm.proposedTimeline && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                  dateRange.to ? (
                                    <>
                                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                                    </>
                                  ) : (
                                    format(dateRange.from, "MMM dd, yyyy")
                                  )
                                ) : applyForm.proposedTimeline ? (
                                  applyForm.proposedTimeline
                                ) : (
                                  <span>Pick date range</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateRange?.from}
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                disabled={(date) => {
                                  const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                  const isUnavailable = isDateUnavailable(date);
                                  return isPast || isUnavailable;
                                }}
                                modifiers={{
                                  unavailable: (date) => isDateUnavailable(date),
                                }}
                                modifiersStyles={{
                                  unavailable: {
                                    backgroundColor: '#fee2e2',
                                    color: '#991b1b',
                                    textDecoration: 'line-through',
                                    opacity: 0.7,
                                    cursor: 'not-allowed',
                                  },
                                }}
                              />
                              <div className="border-t p-3 space-y-2">
                                {unavailableDates.length > 0 && (
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                      <span className="inline-block w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
                                      {unavailableDates.length} unavailable date{unavailableDates.length !== 1 ? 's' : ''} (shown in red)
                                    </span>
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDateRange(undefined)}
                                  >
                                    Clear
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                      const prompt = window.prompt("Enter timeline manually (e.g., '2 weeks'):");
                                      if (prompt) {
                                        setApplyForm({ ...applyForm, proposedTimeline: prompt });
                                        setDateRange(undefined);
                                      }
                                    }}
                                  >
                                    Manual Entry
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      {/* Warning for unavailable dates in range */}
                      {checkUnavailableInRange() && (
                        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <p className="font-semibold text-destructive">Cannot apply with this timeline</p>
                            <p className="text-muted-foreground mt-0.5">
                              Your selected dates include unavailable days: <strong>{checkUnavailableInRange()?.join(", ")}</strong>. 
                              Please select different dates.
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleApply(listing._id)}
                          disabled={createApp.isPending || !applyForm.coverLetter.trim() || !!checkUnavailableInRange()}
                        >
                          {createApp.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Send size={14} className="mr-2" />
                          )}
                          Submit Application
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setExpandedId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4">
        <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </DashboardLayout>
  );
}
