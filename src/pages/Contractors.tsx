import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { AppPagination } from "@/components/AppPagination";
import { Button } from "@/components/ui/button";
import { useContractors } from "@/hooks/use-api";

const PAGE_SIZE = 6;

export default function Contractors() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || "",
    minRating: "",
    minHourlyRate: "",
    maxHourlyRate: "",
    verified: false,
    available: false,
  });
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const { data, isLoading, isError } = useContractors({
    trade: filters.category && filters.category !== "all" ? filters.category : undefined,
    location: filters.location || undefined,
    minRating: filters.minRating && filters.minRating !== "any" ? parseFloat(filters.minRating) : undefined,
    isVerified: filters.verified || undefined,
    minHourlyRate: filters.minHourlyRate && !isNaN(parseFloat(filters.minHourlyRate)) ? parseFloat(filters.minHourlyRate) : undefined,
    maxHourlyRate: filters.maxHourlyRate && !isNaN(parseFloat(filters.maxHourlyRate)) ? parseFloat(filters.maxHourlyRate) : undefined,
    page,
    limit: PAGE_SIZE,
  });

  const contractors = data?.contractors ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-main py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Find Contractors</h1>
            <p className="text-sm text-muted-foreground">{total} contractors found</p>
          </div>
          <Button variant="outline" className="lg:hidden" onClick={() => setMobileFilters(true)}>
            <SlidersHorizontal size={16} className="mr-2" /> Filters
          </Button>
        </div>

        <div className="flex gap-8">
          <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} mobileOpen={mobileFilters} onClose={() => setMobileFilters(false)} />
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <p className="text-lg font-medium text-destructive">Failed to load contractors.</p>
                <p className="mt-1 text-sm text-muted-foreground">Please check your connection and try again.</p>
              </div>
            ) : contractors.length === 0 ? (
              <div className="rounded-lg border bg-card p-12 text-center">
                <p className="text-lg font-medium text-muted-foreground">No contractors match your filters.</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {contractors.map((c) => (
                  <ContractorCard key={c._id} contractor={c} />
                ))}
              </div>
            )}
            <AppPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
