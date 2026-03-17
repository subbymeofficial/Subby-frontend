import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { clientNavItems } from "./ClientOverview";
import { useMyListings, useCreateListing, useUpdateListing, useDeleteListing, useCreateJobPayment, useCategories, useSubscriptionStatus } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Plus, Trash2, Loader2, CreditCard, Pencil, X } from "lucide-react";

const URGENCY_OPTIONS = ["low", "medium", "high", "urgent"];
const STATUS_OPTIONS = ["open", "in_progress", "completed", "cancelled"];

export default function ClientListings() {
  const navigate = useNavigate();
  const { data: listings, isLoading } = useMyListings();
  const { data: subStatus } = useSubscriptionStatus();
  const createListing = useCreateListing();
  const hasClientSubscription =
    subStatus?.plan === "client" &&
    (subStatus?.status === "active" || subStatus?.status === "trialing");
  const updateListing = useUpdateListing();
  const deleteListing = useDeleteListing();
  const jobPayment = useCreateJobPayment();
  const { data: categories } = useCategories();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "", location: "", budgetMin: "", budgetMax: "", urgency: "medium" });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", category: "", location: "", budgetMin: "", budgetMax: "", urgency: "medium" });
  const [payForm, setPayForm] = useState<{ listingId: string; contractorId: string; amount: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createListing.mutateAsync({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        budget: form.budgetMin ? { min: Number(form.budgetMin), max: Number(form.budgetMax) || Number(form.budgetMin) } : undefined,
        urgency: form.urgency,
      });
      toast({ title: "Success", description: "Listing created" });
      setShowForm(false);
      setForm({ title: "", description: "", category: "", location: "", budgetMin: "", budgetMax: "", urgency: "medium" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const startEdit = (l: typeof listings extends (infer T)[] | undefined ? T : never) => {
    if (!l) return;
    setEditId(l._id);
    setEditForm({
      title: l.title, description: l.description, category: l.category,
      location: l.location, budgetMin: l.budget?.min?.toString() || "",
      budgetMax: l.budget?.max?.toString() || "", urgency: l.urgency || "medium",
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      await updateListing.mutateAsync({
        id: editId,
        data: {
          title: editForm.title, description: editForm.description,
          category: editForm.category, location: editForm.location,
          urgency: editForm.urgency,
          budget: editForm.budgetMin ? { min: Number(editForm.budgetMin), max: Number(editForm.budgetMax) || Number(editForm.budgetMin) } : undefined,
        },
      });
      toast({ title: "Updated", description: "Listing updated" });
      setEditId(null);
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateListing.mutateAsync({ id, data: { status } });
      toast({ title: "Updated", description: `Status changed to ${status.replace("_", " ")}` });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this listing?")) return;
    try {
      await deleteListing.mutateAsync(id);
      toast({ title: "Deleted", description: "Listing removed" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handlePayForJob = async () => {
    if (!payForm) return;
    try {
      const { url } = await jobPayment.mutateAsync({
        listingId: payForm.listingId,
        contractorId: payForm.contractorId,
        amount: Number(payForm.amount),
      });
      window.location.href = url;
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const renderForm = (
    values: typeof form,
    setValues: (v: typeof form) => void,
    onSubmit: (e: React.FormEvent) => void,
    isPending: boolean,
    label: string,
    onCancel: () => void,
  ) => (
    <form onSubmit={onSubmit} className="mb-6 rounded-lg border bg-card p-6 card-shadow space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Title</Label><Input value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} required /></div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={values.category} onValueChange={(v) => setValues({ ...values, category: v })}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {(categories ?? []).map((c) => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2"><Label>Description</Label><Textarea value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} rows={3} required /></div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2"><Label>Location</Label><Input value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })} required /></div>
        <div className="space-y-2"><Label>Budget Min ($)</Label><Input type="number" value={values.budgetMin} onChange={(e) => setValues({ ...values, budgetMin: e.target.value })} /></div>
        <div className="space-y-2"><Label>Budget Max ($)</Label><Input type="number" value={values.budgetMax} onChange={(e) => setValues({ ...values, budgetMax: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>Urgency</Label>
          <Select value={values.urgency} onValueChange={(v) => setValues({ ...values, urgency: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {URGENCY_OPTIONS.map((u) => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {label}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );

  return (
    <DashboardLayout title="Client Dashboard" navItems={clientNavItems}>
      {!hasClientSubscription && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-foreground font-medium">Subscribe to post job listings.</p>
          <Button asChild size="sm">
            <Link to="/dashboard/client/subscription">
              <CreditCard size={16} className="mr-1" /> Subscribe — $10/week
            </Link>
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">My Listings</h2>
        <Button
          size="sm"
          onClick={() => {
            if (!hasClientSubscription) {
              navigate("/dashboard/client/subscription");
              return;
            }
            setShowForm(!showForm);
            setEditId(null);
          }}
        >
          <Plus size={16} className="mr-1" /> New Listing
        </Button>
      </div>

      {showForm && !editId && hasClientSubscription && renderForm(form, setForm, handleCreate, createListing.isPending, "Create", () => setShowForm(false))}
      {editId && renderForm(editForm, setEditForm, handleEdit, updateListing.isPending, "Save Changes", () => setEditId(null))}

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !listings || listings.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-muted-foreground">No listings yet. Create your first job listing!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l._id} className="rounded-lg border bg-card p-4 card-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{l.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary">{l.category}</Badge>
                    <Badge variant={l.urgency === "urgent" ? "destructive" : l.urgency === "high" ? "default" : "outline"} className="capitalize">{l.urgency}</Badge>
                    <span className="text-xs text-muted-foreground">{l.applicationCount} apps</span>
                    {l.budget && <span className="text-xs text-muted-foreground">${l.budget.min}–${l.budget.max}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={l.status} onValueChange={(v) => handleStatusChange(l._id, v)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => <SelectItem key={s} value={s} className="capitalize text-xs">{s.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {l.assignedContractorId && (
                    <Button size="sm" variant="outline" onClick={() => setPayForm({
                      listingId: l._id,
                      contractorId: typeof l.assignedContractorId === "object" ? l.assignedContractorId._id : l.assignedContractorId || "",
                      amount: l.budget?.max?.toString() || "",
                    })}>
                      <CreditCard size={14} className="mr-1" /> Pay
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => startEdit(l)}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(l._id)}>
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              </div>
              {payForm?.listingId === l._id && (
                <div className="mt-3 flex items-end gap-3 rounded-lg bg-secondary p-3">
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Contractor ID</Label>
                    <Input value={payForm.contractorId} onChange={(e) => setPayForm({ ...payForm, contractorId: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1 w-32">
                    <Label className="text-xs">Amount ($)</Label>
                    <Input type="number" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <Button size="sm" onClick={handlePayForJob} disabled={jobPayment.isPending}>
                    {jobPayment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPayForm(null)}><X size={14} /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
