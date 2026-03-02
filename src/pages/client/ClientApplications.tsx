import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { clientNavItems } from "./ClientOverview";
import { useMyListings, useListingApplications, useUpdateApplicationStatus, useUpdateListing } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Loader2, CheckCircle, XCircle, Star, ChevronDown, ChevronUp } from "lucide-react";
import type { Listing, Application, User } from "@/lib/types";

function ApplicationsForListing({ listing }: { listing: Listing }) {
  const [expanded, setExpanded] = useState((listing.applicationCount ?? 0) > 0);
  const { data: applications, isLoading } = useListingApplications(expanded ? listing._id : undefined);
  const updateStatus = useUpdateApplicationStatus();
  const updateListing = useUpdateListing();
  const { toast } = useToast();

  const handleAccept = async (appId: string, contractor: User | string) => {
    try {
      await updateStatus.mutateAsync({ id: appId, status: "accepted" });
      const contractorId = typeof contractor === "object" ? contractor._id : contractor;
      await updateListing.mutateAsync({
        id: listing._id,
        data: { status: "in_progress", assignedContractorId: contractorId },
      });
      toast({ title: "Accepted", description: "Application accepted and job set to In Progress" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleReject = async (appId: string) => {
    try {
      await updateStatus.mutateAsync({ id: appId, status: "rejected" });
      toast({ title: "Rejected", description: "Application rejected" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <div className="rounded-lg border bg-card card-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <p className="font-medium text-foreground">{listing.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{listing.category}</Badge>
            <Badge variant={listing.status === "open" ? "default" : "outline"} className="capitalize">
              {listing.status.replace("_", " ")}
            </Badge>
            <span className="text-xs text-muted-foreground">{listing.applicationCount} applications</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4">
          {isLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : !applications || applications.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {applications.map((app: Application) => {
                const contractor = typeof app.contractorId === "object" ? (app.contractorId as User) : null;
                return (
                  <div key={app._id} className="rounded-lg bg-secondary p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{contractor?.name || "Contractor"}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {contractor?.trade && <span className="text-xs text-muted-foreground">{contractor.trade}</span>}
                          {contractor?.averageRating ? (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" /> {contractor.averageRating}
                            </span>
                          ) : null}
                          {contractor?.isVerified && <Badge variant="default" className="text-[10px] px-1.5 py-0">Verified</Badge>}
                        </div>
                        {app.proposedRate && (
                          <p className="text-sm text-muted-foreground mt-1">Rate: ${app.proposedRate}/hr</p>
                        )}
                        {app.proposedTimeline && (
                          <p className="text-sm text-muted-foreground">Timeline: {app.proposedTimeline}</p>
                        )}
                      </div>
                      <Badge
                        variant={app.status === "pending" ? "secondary" : app.status === "accepted" ? "default" : "outline"}
                        className="capitalize"
                      >
                        {app.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{app.coverLetter}</p>
                    {app.status === "pending" && listing.status === "open" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(app._id, app.contractorId)}
                          disabled={updateStatus.isPending}
                        >
                          {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={14} className="mr-1" />}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(app._id)}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientApplications() {
  const { data: listings, isLoading } = useMyListings();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = statusFilter === "all"
    ? listings
    : listings?.filter((l) => l.status === statusFilter);

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Applications</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !filtered || filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-muted-foreground">No listings found. Create a job listing to start receiving applications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => (
            <ApplicationsForListing key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
