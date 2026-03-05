import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { adminNavItems } from "./AdminOverview";
import {
  useTrades,
  useCreateTrade,
  useUpdateTrade,
  useDeleteTrade,
  useAddSubcategory,
  useRemoveSubcategory,
} from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiError } from "@/context/AuthContext";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

export default function AdminTrades() {
  const { data: trades, isLoading } = useTrades();
  const createTrade = useCreateTrade();
  const updateTrade = useUpdateTrade();
  const deleteTrade = useDeleteTrade();
  const addSub = useAddSubcategory();
  const removeSub = useRemoveSubcategory();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addSubTradeId, setAddSubTradeId] = useState<string | null>(null);
  const [newSubName, setNewSubName] = useState("");
  const [globalSubParentId, setGlobalSubParentId] = useState<string>("");
  const [globalSubName, setGlobalSubName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createTrade.mutateAsync(newName.trim());
      toast({ title: "Created", description: `Trade "${newName}" added` });
      setNewName("");
      setShowAdd(false);
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateTrade.mutateAsync({ id, name: editName.trim() });
      toast({ title: "Updated" });
      setEditId(null);
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete trade "${name}"?`)) return;
    try {
      await deleteTrade.mutateAsync(id);
      toast({ title: "Deleted" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleAddSub = async (tradeId: string) => {
    if (!newSubName.trim()) return;
    try {
      await addSub.mutateAsync({ tradeId, name: newSubName.trim() });
      toast({ title: "Subcategory added" });
      setNewSubName("");
      setAddSubTradeId(null);
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleAddSubFromDropdown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSubParentId || !globalSubName.trim()) return;
    try {
      await addSub.mutateAsync({ tradeId: globalSubParentId, name: globalSubName.trim() });
      toast({ title: "Subcategory added" });
      setGlobalSubParentId("");
      setGlobalSubName("");
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleRemoveSub = async (tradeId: string, slug: string) => {
    try {
      await removeSub.mutateAsync({ tradeId, slug });
      toast({ title: "Subcategory removed" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <AdminLayout navItems={adminNavItems}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Trades & Subcategories</h2>
        <Button size="sm" onClick={() => { setShowAdd(!showAdd); if (showAdd) setNewName(""); }}>
          {showAdd ? <X size={16} className="mr-1" /> : <Plus size={16} className="mr-1" />}
          {showAdd ? "Cancel" : "Add Trade"}
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border bg-card p-5 card-shadow">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Trade Name</Label>
              <Input
                placeholder="e.g. Plumbing"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={createTrade.isPending}>
                {createTrade.isPending ? <Loader2 size={16} className="animate-spin" /> : "Add"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {trades && trades.length > 0 && (
        <form
          onSubmit={handleAddSubFromDropdown}
          className="mb-6 rounded-lg border bg-card p-5 card-shadow"
        >
          <Label className="mb-2 block">Add Subcategory</Label>
          <p className="text-sm text-muted-foreground mb-3">Select a parent trade, then enter the subcategory name.</p>
          <div className="flex gap-3 flex-wrap">
            <div className="min-w-[180px]">
              <Label className="text-xs text-muted-foreground">Parent Trade</Label>
              <Select value={globalSubParentId || undefined} onValueChange={setGlobalSubParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent trade" />
                </SelectTrigger>
                <SelectContent>
                  {trades.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <Label className="text-xs text-muted-foreground">Subcategory Name</Label>
              <Input
                placeholder="e.g. Leak Repair"
                value={globalSubName}
                onChange={(e) => setGlobalSubName(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                size="sm"
                disabled={addSub.isPending || !globalSubParentId || !globalSubName.trim()}
              >
                {addSub.isPending ? <Loader2 size={16} className="animate-spin" /> : "Add Subcategory"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !trades || trades.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center card-shadow">
          <p className="text-muted-foreground">No trades yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trades.map((trade) => (
            <div key={trade._id} className="rounded-lg border bg-card p-4 card-shadow">
              {editId === trade._id ? (
                <div className="flex items-center gap-3">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => handleUpdate(trade._id)} disabled={updateTrade.isPending}>
                    <Check size={14} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                    <X size={14} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{trade.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditId(trade._id); setEditName(trade.name); }}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(trade._id, trade.name)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setAddSubTradeId(addSubTradeId === trade._id ? null : trade._id); setNewSubName(""); }}
                    >
                      + Subcategory
                    </Button>
                  </div>
                </div>
              )}

              {addSubTradeId === trade._id && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleAddSub(trade._id); }}
                  className="mt-3 flex gap-2"
                >
                  <Input
                    placeholder="Subcategory name"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={addSub.isPending}>Add</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAddSubTradeId(null)}>Cancel</Button>
                </form>
              )}

              {trade.subcategories && trade.subcategories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {trade.subcategories.map((s) => (
                    <span
                      key={s.slug}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveSub(trade._id, s.slug)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
