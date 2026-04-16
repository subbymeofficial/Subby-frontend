import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Loader2, PartyPopper, Plus, X } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { VerificationDocumentsUpload } from "@/components/VerificationDocumentsUpload";

const TRADES_BY_CATEGORY: Record<string, string[]> = {
  "Boilermaker / Welder": ["Boilermaker", "Welder - MIG", "Welder - TIG", "Welder - Stick/Arc", "Pipe Welder", "Steel Fabricator"],
  "Building": ["Piling Labourer", "Piling Rig Operator", "Crane Operator", "Tower Crane Operator", "Excavator Operator", "Builders Labourer", "Carpenter", "Roofer", "Concreter", "Stonemason", "Scaffolder", "Plasterer", "Tiler", "Bricklayer", "Demolition", "Fencer", "Glazier", "Gyprocker / Drywaller", "Insulation Installer", "Renderer", "Waterproofer"],
  "Civil": ["Labourer", "Excavator Operator", "Grader Operator", "Moxy Operator", "Supervisor", "Project Manager", "Crane Operator", "Concretor - Civil", "Drainer", "Pipelayer", "Road Worker", "Traffic Controller"],
  "Corporate": ["Reception Staff", "Data Entry Clerk", "Administrative Assistant", "Project Manager", "Site Supervisor", "Estimator", "Bookkeeper"],
  "Electrician": ["Residential", "Commercial", "Air Conditioning", "Solar", "Industrial"],
  "Mechanical": ["Automotive", "Light Engines", "Marine", "Heavy Diesel", "HVAC Technician", "Refrigeration Mechanic", "Mechanical Fitter", "Fire Protection"],
  "Owner Operators": ["Mini Excavator up to 2.5t", "Excavator 2.6-5t", "5-6t Combo (excavator, bobcat, tipper)", "6.5-8t Excavator", "6.5-8t Combo (excavator, bobcat, tipper)", "8.5-10t Excavator", "10.5-13.5t Excavator", "14t-19t Excavator", "20-25t Excavator", "26-30t Excavator", "30t plus Excavator", "Grader", "Posi Track / Bobcat", "Water Cart", "Franna Crane", "Crane Truck", "6m3 Tipper", "10m3 Tipper / Dump Truck", "Truck and Tri Axel Tipper", "Truck and 4 Axel Trailer (PBS)", "Concrete Line Pump", "Concrete Boom Pump", "Roller / Compactor", "Telehandler", "EWP / Boom Lift", "Scissor Lift"],
  "Painter": ["Building", "Automotive", "Industrial / Commercial"],
  "Plumbing": ["Residential", "Civil", "Commercial", "Gas Fitter", "Drainer / Drainage"],
  "Landscaping & Outdoor": ["Landscaper", "Lawn & Turf Specialist", "Arborist / Tree Surgeon", "Paving Specialist", "Retaining Wall Builder", "Irrigation Installer", "Pool Builder", "Deck & Pergola Builder", "Bobcat & Garden Labourer"],
  "Cleaning Services": ["Commercial Cleaner", "Residential Cleaner", "Window Cleaner", "Carpet Cleaner", "Pressure Washer", "Construction Cleaner", "Industrial Cleaner", "Bin & Waste Cleaner", "End of Lease Cleaner"],
  "Personal Services": ["Barber", "Hairdresser / Stylist", "Beauty Therapist", "Nail Technician", "Massage Therapist", "Dog Groomer", "Personal Trainer", "Photographer", "Videographer", "Makeup Artist"],
  "Hospitality & Events": ["Chef / Cook", "Bartender", "Wait Staff", "Event Setup Crew", "Caterer", "DJ / Sound Tech", "Security Guard", "Barista"],
  "Transport & Delivery": ["Courier / Delivery Driver", "Furniture Removalist", "Tow Truck Operator", "Truck Driver - HR/HC/MC"],
  "IT & Technology": ["IT Support Technician", "CCTV / Security Installer", "Data Cabling Installer", "AV Installer", "Smart Home Installer", "Phone / Intercom Installer", "Web Developer / Designer", "Graphic Designer"],
  "Home Services": ["Handyman", "Locksmith", "Pest Controller", "Appliance Repairer", "Curtain & Blind Installer", "Antenna Installer", "Cabinet Maker", "Garage Door Installer", "Mobile Mechanic"],
  "Temping & Freelance": ["Receptionist", "Teacher / Tutor", "Teacher Aide", "Childcare Worker", "Aged Care Worker", "Disability Support Worker", "Registered Nurse", "Enrolled Nurse", "Dental Nurse / Assistant", "Physiotherapist", "Occupational Therapist", "Speech Pathologist", "Accountant", "Bookkeeper", "Legal Secretary", "Paralegal", "Marketing Consultant", "Copywriter", "Virtual Assistant", "Interpreter / Translator", "Real Estate Agent", "Property Manager", "Mortgage Broker", "Insurance Broker", "Warehouse Worker", "Forklift Operator", "Labourer - General", "Night Fill / Shelf Stacker", "Retail Assistant"],
  "Specialty & Other": ["Sign Writer", "Line Marker", "Sandblaster", "Asbestos Removalist", "Diver - Commercial", "Surveyor", "Drafts Person / CAD", "Safety Officer / Advisor", "First Aid Officer"],
};

const CATEGORY_KEYS = Object.keys(TRADES_BY_CATEGORY);

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
  const parts = [digits.slice(0,2), digits.slice(2,5), digits.slice(5,8), digits.slice(8,11)].filter(Boolean);
  return parts.join(" ");
}

export default function ContractorEditProfile() {
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const toggleAvailability = useToggleAvailability();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";

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

  const [pickerCategory, setPickerCategory] = useState("");
  const [pickerSpecialisation, setPickerSpecialisation] = useState("");

  const toggleInArray = (key: "tickets" | "insurance" | "availableDays", value: string) => {
    setForm((f) => {
      const list = f[key] as string[];
      return { ...f, [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] };
    });
  };

  const addTrade = () => {
    if (!pickerCategory || !pickerSpecialisation) return;
    const tradeValue = `${pickerCategory} > ${pickerSpecialisation}`;
    if (form.trades.includes(tradeValue)) {
      toast({ title: "Already added", description: "That trade is already in your list.", variant: "destructive" });
      return;
    }
    setForm((f) => ({ ...f, trades: [...f.trades, tradeValue] }));
    setPickerCategory("");
    setPickerSpecialisation("");
  };

  const removeTrade = (trade: string) => {
    setForm((f) => ({ ...f, trades: f.trades.filter((t) => t !== trade) }));
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
      toast({ title: "Add at least one trade", description: "Select your category and specialisation.", variant: "destructive" });
      return;
    }
    try {
      // Derive a legacy single-trade field from the first entry for backward compat
      const primaryTrade = form.trades[0]?.split(" > ").pop() || form.trades[0] || "";
      await updateProfile.mutateAsync({
        id: userId,
        data: {
          name: form.name,
          trade: primaryTrade,
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
        description: user?.isActive ? "You won't appear in search results" : "You're now visible to clients",
      });
    } catch (error) {
      toast({ title: "Error", description: getApiError(error), variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Contractor Dashboard" navItems={contractorNavItems}>
      <div className="max-w-3xl space-y-6">

        {/* Onboarding welcome banner */}
        {isOnboarding && (
          <div className="rounded-xl border border-[#2E3192]/30 bg-[#2E3192]/5 p-5 flex items-start gap-4">
            <PartyPopper className="h-7 w-7 text-[#2E3192] mt-0.5 shrink-0" />
            <div>
              <h2 className="font-semibold text-[#2E3192] text-lg">Welcome to SubbyMe!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your subscription is active. Complete your profile below so clients can find and hire you.
                Add your trade, location, a profile photo, and upload your verification documents to get the most out of SubbyMe.
              </p>
            </div>
          </div>
        )}

        {/* Availability Toggle */}
        <div className="rounded-lg border bg-card p-6 card-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Availability Status</h3>
              <p className="text-sm text-muted-foreground">
                {user?.isActive ? "You're available for work and visible in search." : "You're currently unavailable."}
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

            {/* Name + ABN */}
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
                {form.abn && !abnValid && <p className="text-xs text-destructive">Must be 11 digits.</p>}
              </div>
            </div>

            {/* Trades */}
            <div className="space-y-3">
              <Label>Trades <span className="text-xs text-muted-foreground">(add one or more)</span></Label>

              {/* Selected trade chips */}
              {form.trades.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.trades.map((trade) => (
                    <span
                      key={trade}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#2E3192] text-white text-sm px-3 py-1.5 font-medium"
                    >
                      {trade}
                      <button
                        type="button"
                        onClick={() => removeTrade(trade)}
                        className="rounded-full hover:bg-white/20 p-0.5 transition"
                        aria-label={`Remove ${trade}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Category + Specialisation picker */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
                    <select
                      value={pickerCategory}
                      onChange={(e) => { setPickerCategory(e.target.value); setPickerSpecialisation(""); }}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/40"
                    >
                      <option value="">Select category...</option>
                      {CATEGORY_KEYS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Specialisation</label>
                    <select
                      value={pickerSpecialisation}
                      onChange={(e) => setPickerSpecialisation(e.target.value)}
                      disabled={!pickerCategory}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select specialisation...</option>
                      {pickerCategory &&
                        TRADES_BY_CATEGORY[pickerCategory]?.map((spec) => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addTrade}
                  disabled={!pickerCategory || !pickerSpecialisation}
                  className="bg-[#2E3192] hover:bg-[#1E2270] disabled:opacity-40"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {form.trades.length === 0 ? "Add trade" : "Add another trade"}
                </Button>
              </div>

              {form.trades.length === 0 && (
                <p className="text-xs text-destructive">Add at least one trade to continue.</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Sydney, NSW"
              />
            </div>

            {/* Rate + Phone */}
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

            {/* Bio */}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Describe your experience and services..."
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
              <Input
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. Wiring, Lighting, Solar"
              />
            </div>

            {/* Tickets */}
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
                        active ? "bg-[#FBBF24] text-slate-900 border-[#FBBF24]" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
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
                        active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
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
                        active ? "bg-[#2E3192] text-white border-[#2E3192]" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateProfile.isPending}
              size="lg"
              className="bg-[#2E3192] hover:bg-[#1E2270]"
            >
              {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
