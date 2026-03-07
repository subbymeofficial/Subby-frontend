import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminNavItems } from "./AdminOverview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminUsers, useVerificationDocsForUser } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Loader2, ShieldCheck, ShieldX, Eye } from "lucide-react";
import type { VerificationDocument } from "@/services/verification-admin.service";
import { verificationAdminService } from "@/services/verification-admin.service";
import { verificationService } from "@/services/verification.service";

type VerifyFilter = "all" | "unverified" | "verified";

function getBadge(documents: VerificationDocument[], type: VerificationDocument["type"]) {
  const doc = documents.find((d) => d.type === type);
  if (!doc) return { label: "Not submitted", variant: "outline" as const };
  if (doc.status === "approved") return { label: "Approved", variant: "default" as const };
  if (doc.status === "rejected") return { label: "Rejected", variant: "destructive" as const };
  return { label: "Pending", variant: "secondary" as const };
}

export default function AdminVerifications() {
  const qc = useQueryClient();
  const { data, isLoading } = useAdminUsers({ role: "contractor", limit: 100 });
  const { toast } = useToast();
  const [filter, setFilter] = useState<VerifyFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<{ url: string; title: string } | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const { data: docs } = useVerificationDocsForUser(selectedUserId || undefined);

  const allContractors = data?.users ?? [];
  const contractors = filter === "all"
    ? allContractors
    : filter === "verified"
      ? allContractors.filter((c) => c.isVerified)
      : allContractors.filter((c) => !c.isVerified);

  const unverifiedCount = allContractors.filter((c) => !c.isVerified).length;
  const verifiedCount = allContractors.filter((c) => c.isVerified).length;

  const handleApprove = async (docId: string) => {
    try {
      await verificationAdminService.approveDocument(docId);
      qc.invalidateQueries({ queryKey: ["verification-docs"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Approved", description: "Verification document approved." });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleReject = async (docId: string) => {
    const reason = window.prompt("Enter rejection reason (optional):") ?? "Rejected by admin";
    try {
      await verificationAdminService.rejectDocument(docId, reason);
      qc.invalidateQueries({ queryKey: ["verification-docs"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({ title: "Rejected", description: "Verification document rejected." });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <AdminLayout navItems={adminNavItems}>
      <h2 className="mb-4 text-lg font-semibold text-foreground">Contractor Verifications</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          All ({allContractors.length})
        </Button>
        <Button size="sm" variant={filter === "unverified" ? "default" : "outline"} onClick={() => setFilter("unverified")}>
          Unverified ({unverifiedCount})
        </Button>
        <Button size="sm" variant={filter === "verified" ? "default" : "outline"} onClick={() => setFilter("verified")}>
          Verified ({verifiedCount})
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
          <div className="overflow-x-auto rounded-lg border bg-card card-shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary">
                  <th className="p-3 text-left font-medium text-muted-foreground">Contractor</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Trade</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Overall</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((c) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="p-3 font-medium text-foreground">{c.name}</td>
                    <td className="p-3 text-muted-foreground text-xs">{c.email}</td>
                    <td className="p-3 text-muted-foreground">{c.trade || "Not set"}</td>
                    <td className="p-3">
                      <Badge variant={c.isVerified ? "default" : "outline"}>
                        {c.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUserId(c._id)}
                      >
                        <Eye size={14} className="mr-1" /> View Documents
                      </Button>
                    </td>
                  </tr>
                ))}
                {contractors.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No contractors found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border bg-card p-4 card-shadow">
            <h3 className="font-semibold text-foreground mb-2">Verification Documents</h3>
            {!selectedUserId ? (
              <p className="text-sm text-muted-foreground">Select a contractor to view their verification documents.</p>
            ) : !docs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No verification documents submitted.</p>
            ) : (
              <div className="space-y-3">
                {(["id", "abn", "insurance", "qualification"] as VerificationDocument["type"][]).map((type) => {
                  const { label, variant } = getBadge(docs, type);
                  const doc = docs.find((d) => d.type === type);
                  return (
                    <div key={type} className="flex items-center justify-between rounded bg-secondary p-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-medium text-foreground capitalize">
                          {type === "id" ? "ID" : type === "abn" ? "ABN" : type === "insurance" ? "Insurance" : "Qualification"}
                        </p>
                        <Badge variant={variant} className="text-xs">
                          {label}
                        </Badge>
                        {doc?.expiryDate && (
                          <p className="text-xs text-muted-foreground">
                            Expiry date: {new Date(doc.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {doc && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-auto px-2 py-1 text-xs"
                            disabled={loadingDoc}
                            onClick={async () => {
                              setLoadingDoc(true);
                              try {
                                const docId = doc._id ?? (doc as { id?: string }).id;
                                if (!docId) throw new Error("Document ID not found");
                                const { blob } = await verificationService.fetchDocumentBlob(docId);
                                setViewDoc({
                                  url: URL.createObjectURL(blob),
                                  title: `${type === "id" ? "ID" : type === "abn" ? "ABN" : type === "insurance" ? "Insurance" : "Qualification"} Document`,
                                });
                              } catch (e) {
                                toast({ title: "Error", description: getApiError(e), variant: "destructive" });
                              } finally {
                                setLoadingDoc(false);
                              }
                            }}
                          >
                            <Eye size={14} className="mr-1" /> View
                          </Button>
                          {doc.status !== "approved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(doc._id)}
                            >
                              <ShieldCheck size={14} className="mr-1" /> Approve
                            </Button>
                          )}
                          {doc.status !== "rejected" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(doc._id)}
                            >
                              <ShieldX size={14} className="mr-1" /> Reject
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={!!viewDoc}
        onOpenChange={(open) => {
          if (!open && viewDoc) {
            URL.revokeObjectURL(viewDoc.url);
            setViewDoc(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{viewDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 flex flex-col">
            <iframe
              src={viewDoc?.url}
              title={viewDoc?.title}
              className="w-full h-[70vh] min-h-[400px] border rounded-md bg-muted"
            />
            <a
              href={viewDoc?.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 text-sm text-primary hover:underline"
            >
              Open in new tab
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
