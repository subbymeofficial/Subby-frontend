import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ContractorCard } from "@/components/ContractorCard";
import { useSavedContractors, useUnsaveContractor, useCreateConversation } from "@/hooks/use-api";
import { clientNavItems } from "./ClientOverview";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Loader2, HeartOff, MessageSquare, Heart } from "lucide-react";

export default function ClientSaved() {
  const navigate = useNavigate();
  const { data: contractors, isLoading } = useSavedContractors();
  const unsave = useUnsaveContractor();
  const createConversation = useCreateConversation();
  const { toast } = useToast();

  const handleUnsave = async (id: string) => {
    try {
      await unsave.mutateAsync(id);
      toast({ title: "Removed", description: "Contractor removed from saved list" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleMessage = async (id: string) => {
    try {
      const conv = await createConversation.mutateAsync({ participantId: id });
      navigate(`/messages?c=${conv._id}`);
    } catch (e) {
      toast({ title: "Could not start chat", description: getApiError(e), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Saved Contractors</h2>
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !contractors || contractors.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-muted-foreground">No saved contractors yet. Browse contractors and save the ones you like!</p>
          <Button asChild variant="outline" className="mt-4">
            <a href="/contractors">Browse Contractors</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {contractors.map((c) => (
            <div key={c._id}>
              <ContractorCard contractor={c} />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => handleMessage(c._id)}
                  disabled={createConversation.isPending}
                >
                  <MessageSquare size={14} className="mr-2" /> Message
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleUnsave(c._id)}
                  disabled={unsave.isPending}
                >
                  <Heart size={14} className="mr-2 fill-current" /> Unsave
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
