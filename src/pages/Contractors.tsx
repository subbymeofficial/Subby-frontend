import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, Loader2, Bookmark, X, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { FilterSidebar, type Filters } from "@/components/FilterSidebar";
import { AppPagination } from "@/components/AppPagination";
import { Button } from "@/components/ui/button";
import { useContractors } from "@/hooks/use-api";
import { useSavedTradies } from "@/hooks/use-saved-tradies";

const PAGE_SIZE = 6;

export default function Contractors() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    subtrade: "",
    minRating: "",
    minHourlyRate: "",
    maxHourlyRate: "",
    verified: false,
    available: false,
  });
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const { saved, isSaved, toggle, remove } = useSavedTradies();

  // Use subtrade if set, otherwise fall back to category
  const tradeQuery =
    filters.subtrade && filters.subtrade !== "all"
      ? filters.subtrade
      : filters.category && filters.category !== "all"
      ? filters.category
      : undefined;

  const { data, isLoading, isError } = useContractors({
    trade: tradeQuery,
    location: filters.location || undefined,
    minRating:
      filters.minRating && filters.minRating !== "any"
        ? parseFloat(filters.minRating)
        : undefined,
    isVerified: filters.verified || undefined,
    minHourlyRate:
      filters.minHourlyRate && !isNaN(parseFloat(filters.minHourlyRate))
        ? parseFloat(filters.minHourlyRate)
        : undefined,
    maxHourlyRate:
      filters.maxHourlyRate && !isNaN(parseFloat(filters.maxHourlyRate))
        ? parseFloat(filters.maxHourlyRate)
        : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const contractors = data?.contractors ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFiltersChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
    setShowSaved(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-8">

        {/* Header row */}
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Contractors</h1>
            <p className="text-sm text-muted-foreground">
              {showSaved
                ? `${saved.length} saved tradie${saved.length === 1 ? "" : "s"}`
                : `${total} contractor${total === 1 ? "" : "s"} found`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Saved tradies toggle */}
            <button
              type="button"
              onClick={() => setShowSaved((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                showSaved
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Bookmark size={14} className={showSaved ? "fill-current" : ""} />
              Saved{saved.length > 0 && <span className="ml-0.5">({saved.length})</span>}
            </button>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFilters(true)}
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          <FilterSidebar
            filters={filters}
            onChange={handleFiltersChange}
            mobileOpen={mobileFilters}
            onClose={() => setMobileFilters(false)}
          />

          <div className="flex-1 min-w-0">

            {/* ── SAVED TRADIES PANEL ── */}
            {showSaved && (
              <div>
                {saved.length === 0 ? (
                  <div className="rounded-lg border bg-card p-12 text-center">
                    <Bookmark size={36} className="mx-auto mb-3 text-muted-foreground/40" />
                    <p className="text-lg font-medium text-muted-foreground">No saved tradies yet.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tap the bookmark icon on any contractor card to save them here for quick access.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setShowSaved(false)}
                    >
                      Browse contractors
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {saved.map((tradie) => (
                      <div
                        key={tradie.id}
                        className="flex items-center gap-4 rounded-lg border bg-card p-4 card-shadow"
                      >
                        <img
                          src={
                            tradie.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${tradie.name}`
                          }
                          alt={tradie.name}
                          className="h-14 w-14 shrink-0 rounded-lg object-cover bg-secondary"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{tradie.name}</p>
                          <p className="text-sm text-primary truncate">{tradie.trade || "General"}</p>
                          {tradie.location && (
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <MapPin size={11} /> {tradie.location}
                            </p>
                          )}
                          {tradie.hourlyRate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ${tradie.hourlyRate}/hr
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button asChild size="sm">
                            <Link to={`/contractors/${tradie.id}`}>View</Link>
                          </Button>
                          <button
                            type="button"
                            onClick={() => remove(tradie.id)}
                            className="rounded-full p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label="Remove from saved"
                            title="Remove"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── SEARCH RESULTS ── */}
            {!showSaved && (
              <>
                {isLoading && (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {!isLoading && isError && (
                  <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-lg font-medium text-destructive">Failed to load contractors.</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Please check your connection and try again.
                    </p>
                  </div>
                )}

                {!isLoading && !isError && contractors.length === 0 && (
                  <div className="rounded-lg border bg-card p-12 text-center">
                    <p className="text-lg font-medium text-muted-foreground">
                      No contractors match your filters.
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try adjusting your search criteria.
                    </p>
                  </div>
                )}

                {!isLoading && !isError && contractors.length > 0 && (
                  <div className="grid gap-4">
                    {contractors.map((c) => (
                      <ContractorCard
                        key={c._id}
                        contractor={c}
                        isSaved={isSaved(String(c._id || c.id))}
                        onToggleSave={() => toggle(c)}
                      />
                    ))}
                  </div>
                )}

                <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
