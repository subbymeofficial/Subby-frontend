import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { contractorNavItems } from "./ContractorOverview";
import { useAuth, getApiError } from "@/context/AuthContext";
import { useUpdateProfile, useToggleAvailability } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { VerificationDocumentsUpload } from "@/components/VerificationDocumentsUpload";

const TRADE_OPTIONS = [
  "Electrician", "Plumber", "Carpenter", "Tiler", "Painter",
  "Roofer", "Concreter", "Plasterer", "Bricklayer", "Landscaper",
  "HVAC", "Glazier", "Excavator Op.", "Labourer", "Scaffolder",
  "Welder", "Steel Fixer", "Cabinet Maker", "Waterproofer", "Demolition",
];

const TICKET_OPTIONS = [
  "White Card", "Working at Heights", "Confined Space", "Asbestos Awareness",
  "First Aid", "EWP Licence", "Forklift Licence", "Traffic Control",
];

const INSURANCE_OPTIONS = [
  "Public Liability", "Workers Comp", "Tools Insurance", "Vehicle Insurance",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatAbn(v: string) {
  const digits = v.replace(/\D/g, "").slice(0, 11);
  // 2-3-3-3 spacing: XX XXX XXX XXX
  const parts = [digits.slice(0,2), digits.slice(2,5), digits.slice(5,8), digits.slice(8,11)].filter(Boolean);
  return parts.join(" ");
}

export default function ContractorEditProfile() {
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const toggleAvailability = useToggleAvailability();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "",
    abn: (user as any)?.abn || "",
    trades: (user as any)?.trades || (user?.trade ? [user.trade] : []) as string[],
    location: user?.location || "",
    hourlyRate: user?.hourlyRate?.toString() || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    phone: user?.phone || "",
    tickets: (user as any)?.tickets || [] as string[],
    insurance: (user as any)?.insurance || [] as string[],
    availableDays: (user as any)?.availableDays || [] as string[],
  });

  const toggleInArray = (key: "trades" | "tickets" | "insurance" | "availableDays", value: string) => {
    setForm((f) => {
      const list = f[key] as string[];
      return {
        ...f,
        [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value],
      };
    });
  };

  const abnValid = form.abn.replace(/\s/g, "").length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) return;

    if (form.abn && !abnValid) {
      toast({ title: "Invalid ABN", description: "ABN must be 11 digits.", variant: "destructive" });
      return;
    }
    if (form.trades.length === 0) {
      toast({ title: "Pick at least one trade", description: "Select the trades you work in so builders can find you.", variant: "destructive" });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        id: userId,
        data: {
          name: form.name,
          // keep legacy single-trade field in sync with first pick so older UI still works
          trade: form.trades[0] || "",
          trades: form.trades,
          abn: form.abn.replace(/\s/g, ""),
          location: form.location,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          bio: form.bio,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          phone: form.phone,
          tickets: form.tickets,
          insurance: form.insurance,
          availableDays: form.availableDays,
        } as any,
      });
      await refreshUser();
      toast({ title: "Saved", description: "Profile updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await toggleAvailability.mutateAsync();
      await refreshUser();
      toast({
        title: user?.isActive ? "Set to Unavailable" : "Set to Available",
        description: user?.isActive
          ? "You won't appear in search results"
          : "You're now visible to clients",
      });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      <div className="max-w-3xl space-y-6">
        {/* Availability Toggle */}
        <div className="rounded-lg border bg-card p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Availability Status</h3>
              <p className="text-sm text-muted-foreground">
                {user?.isActive
                  ? "You're available for work and visible in search."
                  : "You're currently unavailable."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${user?.isActive ? "text-success" : "text-destructive"}`}>
                {user?.isActive ? "Available" : "Unavailable"}
              </span>
              <Switch
                checked={user?.isActive ?? false}
                onCheckedChange={handleToggleAvailability}
                disabled={toggleAvailability.isPending}
              />
            </div>
          </div>
        </div>

        {/* Verification Documents */}
        <VerificationDocumentsUpload />

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 card-shadow">
          <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>

          <div className="mt-4">
            <ProfileImageUpload />
          </div>

          <div className="mt-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ABN <span className="text-xs text-muted-foreground">(11 digits)</span></Label>
                <Input
                  value={form.abn}
                  onChange={(e) => setForm({ ...form, abn: formatAbn(e.target.value) })}
                  placeholder="XX XXX XXX XXX"
                  inputMode="numeric"
                />
                {form.abn && !abnValid && (
                  <p className="text-xs text-destructive">Must be 11 digits.</p>
                )}
              </div>
            </div>

            {/* Trades multi-picker */}
            <div className="space-y-2">
              <Label>Trades you work in <span className="text-xs text-muted-foreground">(pick one or more)</span></Label>
              <div className="flex flex-wrap gap-2">
                {TRADE_OPTIONS.map((t) => {
                  const active = form.trades.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleInArray("trades", t)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-[#2E3192] text-white border-[#2E3192]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {active && <Check className="inline h-3 w-3 mr-1" />}
                      {t}
                    </button>
                  );
                })}
              </div>
              {form.trades.length === 0 && (
                <p className="text-xs text-destructive">Select at least one trade.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Sydney, NSW"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Describe your experience and services..."
              />
            </div>

            <div className="space-y-2">
              <Label>Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. Wiring, Lighting, Solar"
              />
            </div>

            {/* Tickets / Certifications */}
            <div className="space-y-2">
              <Label>Tickets &amp; certifications</Label>
              <div className="flex flex-wrap gap-2">
                {TICKET_OPTIONS.map((t) => {
                  const active = form.tickets.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleInArray("tickets", t)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-[#FBBF24] text-slate-900 border-[#FBBF24]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {active && <Check className="inline h-3 w-3 mr-1" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-2">
              <Label>Insurance held</Label>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((t) => {
                  const active = form.insurance.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleInArray("insurance", t)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${
                        active
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {active && <Check className="inline h-3 w-3 mr-1" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability days */}
            <div className="space-y-2">
              <Label>Days you're available</Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((d) => {
                  const active = form.availableDays.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleInArray("availableDays", d)}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "bg-[#2E3192] text-white border-[#2E3192]"
                          : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={updateProfile.isPending} size="lg" className="bg-[#2E3192] hover:bg-[#1E2270]">
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
