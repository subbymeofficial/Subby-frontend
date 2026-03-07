import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyVerificationDocs, useUploadVerificationDoc } from "@/hooks/use-api";
import { useAuth, getApiError } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, FileText, Eye } from "lucide-react";
import { verificationService } from "@/services/verification.service";
import type { VerificationDocumentType } from "@/services/verification.service";

const DOC_TYPES: { type: VerificationDocumentType; label: string; description: string }[] = [
  { type: "id", label: "ID Document", description: "Government-issued ID (license, passport)" },
  { type: "abn", label: "ABN", description: "Australian Business Number document" },
  { type: "insurance", label: "Insurance", description: "Insurance certificate" },
  { type: "qualification", label: "Qualification", description: "Trade qualification or certification" },
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];

export function VerificationDocumentsUpload() {
  const { user } = useAuth();
  const { data: docs = [], isLoading } = useMyVerificationDocs();
  const upload = useUploadVerificationDoc();
  const { toast } = useToast();
  const [viewDoc, setViewDoc] = useState<{ url: string; title: string } | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [expiryDates, setExpiryDates] = useState<Record<VerificationDocumentType, string>>({
    id: "",
    abn: "",
    insurance: "",
    qualification: "",
  });
  const fileRefs = useRef<Record<VerificationDocumentType, HTMLInputElement | null>>({
    id: null,
    abn: null,
    insurance: null,
    qualification: null,
  });

  if (user?.role !== "contractor") return null;

  const handleUpload = async (type: VerificationDocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const expiryDate = expiryDates[type];
    if (!expiryDate) {
      toast({
        title: "Expiry date required",
        description: "Please select an expiry date for this document before uploading.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPEG, PNG, WebP, or PDF. Max 5MB.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "File must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await upload.mutateAsync({ type, file, expiryDate });
      toast({ title: "Uploaded", description: "Document submitted for review." });
    } catch (error) {
      toast({ title: "Upload failed", description: getApiError(error), variant: "destructive" });
    } finally {
      e.target.value = "";
    }
  };

  const getDocForType = (type: VerificationDocumentType) =>
    docs.find((d) => d.type === type);

  const getStatusBadge = (doc: { status: string; rejectionReason?: string | null } | undefined) => {
    if (!doc) return null;
    if (doc.status === "approved") return <Badge variant="default">Approved</Badge>;
    if (doc.status === "rejected") return (
      <Badge variant="destructive" title={doc.rejectionReason || undefined}>Rejected</Badge>
    );
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="rounded-lg border bg-card p-6 card-shadow">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <FileText size={20} />
        Verification Documents
      </h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        Upload your documents for admin review. This helps clients trust your profile. JPEG, PNG, WebP, or PDF. Max 5MB each.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {DOC_TYPES.map(({ type, label, description }) => {
            const doc = getDocForType(type);
            const isUploading = upload.isPending;
            return (
              <div
                key={type}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-secondary/50 p-4"
              >
                <div className="space-y-2">
                  <div>
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Expiry date
                    </label>
                    <Input
                      type="date"
                      className="h-8 w-[180px]"
                      value={expiryDates[type] || ""}
                      onChange={(ev) =>
                        setExpiryDates((prev) => ({ ...prev, [type]: ev.target.value }))
                      }
                    />
                    {doc?.expiryDate && (
                      <p className="text-[11px] text-muted-foreground">
                        Current expiry:{" "}
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {doc && (
                    <div className="mt-2 flex items-center gap-2">
                      {getStatusBadge(doc)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-2 py-0 text-xs"
                        disabled={loadingDoc}
                        onClick={async () => {
                          setLoadingDoc(true);
                          try {
                            const { blob } = await verificationService.fetchDocumentBlob(doc._id);
                            setViewDoc({
                              url: URL.createObjectURL(blob),
                              title: `${label} Document`,
                            });
                          } catch (e) {
                            toast({ title: "Error", description: getApiError(e), variant: "destructive" });
                          } finally {
                            setLoadingDoc(false);
                          }
                        }}
                      >
                        <Eye size={12} className="mr-1" /> View
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    ref={(el) => { fileRefs.current[type] = el; }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => handleUpload(type, e)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileRefs.current[type]?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Upload size={14} className="mr-1" />
                    )}
                    {doc ? "Replace" : "Upload"}
                  </Button>
                </div>
              </div>
            );
          })}
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
