import { useState, useRef } from "react";
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
import { useMarket } from "@/context/MarketContext";
import { Loader2, PartyPopper, Plus, X, Upload } from "lucide-react";
import { ProfileImageUpload } from "@/components/ProfileImageUpload";
import { VerificationDocumentsUpload } from "@/components/VerificationDocumentsUpload";

// ─── AU Trades ────────────────────────────────────────────────────────────────
const AU_TRADES: Record<string, string[]> = {
  "Boilermaker / Welder": ["Boilermaker", "Welder - MIG", "Welder - TIG", "Welder - Stick/Arc", "Pipe Welder", "Steel Fabricator"],
  "Building": ["Piling Labourer", "Piling Rig Operator", "Crane Operator", "Tower Crane Operator", "Excavator Operator", "Builders Labourer", "Carpenter", "Roofer", "Concreter", "Stonemason", "Scaffolder", "Plasterer", "Tiler", "Bricklayer", "Demolition", "Fencer", "Glazier", "Gyprocker", "Insulation Installer", "Renderer", "Waterproofer"],
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

// ─── US Trades ────────────────────────────────────────────────────────────────
const US_TRADES: Record<string, string[]> = {
  "Construction": ["General Contractor", "Framer / Rough Carpenter", "Finish Carpenter / Trim", "Cabinet Maker / Millwork", "Concrete Worker / Finisher", "Masonry / Bricklayer", "Roofer", "Drywall Installer", "Insulation Installer", "Waterproofing Specialist", "Window & Door Installer", "Glazier", "Flooring Installer", "Tile Setter", "Painter / Finisher", "Demolition Worker", "Scaffolding Worker", "Ironworker", "Structural Steel Worker"],
  "Civil & Heavy": ["Laborer", "Excavator Operator", "Bulldozer Operator", "Grader Operator", "Skid Steer / Bobcat Operator", "Road Construction Worker", "Pipelayer", "Driller", "Traffic Control Flagger", "Surveyor", "Project Manager", "Site Superintendent", "Estimator"],
  "Crane & Rigging": ["Crane Operator", "Tower Crane Operator", "Boom Truck Operator", "Rigger", "Signal Person"],
  "Electrician": ["Residential Electrician", "Commercial Electrician", "Industrial Electrician", "Solar / PV Installer", "Low Voltage Technician", "Lineman"],
  "Plumbing & HVAC": ["Residential Plumber", "Commercial Plumber", "Pipefitter", "HVAC Technician", "Refrigeration Technician", "Gas Fitter", "Steam Fitter"],
  "Welding & Fabrication": ["Structural Welder", "Pipe Welder", "MIG Welder", "TIG Welder", "Stick / Arc Welder", "Steel Fabricator", "Sheet Metal Worker"],
  "Mechanical & Automotive": ["Diesel Mechanic", "Automotive Mechanic", "Heavy Equipment Mechanic", "Marine Mechanic", "HVAC / Refrigeration Mechanic", "Fire Protection Technician"],
  "Owner Operators": ["Mini Excavator (up to 6,000 lbs)", "Excavator (6,000–20,000 lbs)", "Excavator (20,000–50,000 lbs)", "Excavator (50,000+ lbs)", "Bulldozer", "Motor Grader", "Skid Steer / Bobcat", "Water Truck", "Crane Truck", "10–14 Yard Dump Truck", "Semi / Articulated Dump Truck", "Concrete Pump", "Boom Pump", "Roller / Compactor", "Telehandler", "Boom Lift / AWP", "Scissor Lift", "Forklift"],
  "Landscaping & Outdoor": ["Landscaper", "Lawn Care / Turf Specialist", "Arborist / Tree Surgeon", "Paving Specialist", "Retaining Wall Builder", "Irrigation Installer", "Pool Builder", "Deck Builder", "Fence Installer"],
  "Cleaning Services": ["Commercial Cleaner", "Residential Cleaner", "Window Cleaner", "Carpet Cleaner", "Pressure Washer", "Post-Construction Cleaner", "Industrial Cleaner"],
  "Home Services": ["Handyman", "Locksmith", "Pest Control Technician", "Appliance Repair Technician", "Blind & Curtain Installer", "Garage Door Technician", "Smart Home Installer", "Mobile Mechanic"],
  "IT & Technology": ["IT Support Technician", "Network Cabling Installer", "CCTV / Security Installer", "AV Installer", "Web Developer / Designer", "Graphic Designer"],
  "Transport & Logistics": ["Courier / Delivery Driver", "Moving / Relocation Specialist", "Tow Truck Operator", "Truck Driver – Class A CDL", "Truck Driver – Class B CDL", "Hazmat Driver"],
  "Hospitality & Events": ["Chef / Cook", "Bartender", "Server / Wait Staff", "Event Setup Crew", "Catering Staff", "DJ / Sound Technician", "Security Guard", "Barista"],
  "Personal Services": ["Barber", "Hair Stylist", "Esthetician", "Nail Technician", "Massage Therapist", "Dog Groomer", "Personal Trainer", "Photographer", "Videographer"],
  "Staffing & Temp": ["Receptionist", "Administrative Assistant", "Data Entry Clerk", "Teacher / Tutor", "Teacher's Aide", "Childcare Worker", "Home Health Aide", "CNA (Certified Nursing Assistant)", "Registered Nurse (RN)", "Licensed Practical Nurse (LPN)", "Medical Assistant", "Warehouse Worker", "Forklift Operator", "General Laborer", "Retail Associate", "Night Stock / Shelf Stocker", "Accountant", "Bookkeeper", "Paralegal", "Real Estate Agent", "Property Manager", "Mortgage Loan Officer", "Insurance Agent"],
  "Specialty & Other": ["Sign Maker / Installer", "Line Striper", "Sandblaster", "Asbestos / Hazmat Abatement Worker", "Commercial Diver", "Safety Officer / Advisor", "Quality Control Inspector", "First Aid Officer"],
};

// ─── AU Tickets ───────────────────────────────────────────────────────────────
const AU_TICKETS: Record<string, string[]> = {
  "Safety Inductions": ["White Card (General Construction Induction)", "Working at Heights", "Confined Space Entry", "Confined Space Supervisor", "Confined Space Rescue"],
  "Crane Licences (HRWL)": ["C1 Open – Slewing Mobile Crane (Unrestricted)", "Slewing Mobile Crane (up to 20t)", "Slewing Mobile Crane (20–100t)", "Slewing Mobile Crane (100t+)", "C6 – Non-Slewing Mobile Crane (up to 3t)", "C2 – Non-Slewing Mobile Crane (over 3t)", "Self-Erecting Tower Crane", "Tower Crane", "Vehicle Loading Crane", "Bridge and Gantry Crane", "Franna / Pick and Carry Crane", "Portal Boom Crane", "Derrick Crane"],
  "Rigging & Dogging (HRWL)": ["Dogging (DG)", "Rigging Basic (RB)", "Rigging Intermediate (RI)", "Rigging Advanced (RA)"],
  "Scaffolding (HRWL)": ["Scaffolding Basic (SB)", "Scaffolding Intermediate (SI)", "Scaffolding Advanced (SA)"],
  "EWP & Forklift (HRWL)": ["Forklift Licence (LF)", "EWP – Boom Type (WP)", "EWP – Scissor Lift / Vertical", "Telehandler Licence"],
  "First Aid & Emergency": ["First Aid (HLTAID011)", "CPR Only (HLTAID009)", "Advanced First Aid (HLTAID012)", "Mental Health First Aid", "Emergency Warden", "Fire Extinguisher Training"],
  "Asbestos": ["Asbestos Awareness", "Class B – Non-Friable Asbestos Removal", "Class A – Friable Asbestos Removal", "Asbestos Assessor"],
  "Traffic Management": ["Traffic Controller (TC)", "Implement Traffic Control Plans", "Prepare Traffic Management Plans"],
  "Vehicle Licences": ["MR Licence", "HR Licence", "HC Licence", "MC Licence", "Dangerous Goods (DG)", "Tow Truck Operator Licence"],
  "Gas & Plumbing": ["Plumbing Licence", "Gas Fitting Licence", "Drainer's Licence", "Mechanical Services (HVAC) Licence"],
  "Electrical": ["Electrical Contractor Licence", "Electrical Worker Licence (A Grade)", "Restricted Electrical Licence", "Solar PV Accreditation (CEC)", "Switchboard Licence"],
  "Demolition (HRWL)": ["Demolition – Non-Structural", "Demolition – Structural"],
  "Explosive & Pyrotechnics (HRWL)": ["Explosive-Powered Tools (EP)", "Blasting – Surface", "Blasting – Underground", "Pyrotechnics Licence"],
  "Pressure Equipment (HRWL)": ["Boiler Operation – Standard", "Boiler Operation – Advanced", "Steam Turbine Operation", "Reciprocating Engine Operation"],
  "Security & Compliance": ["Security Licence – Class 1", "Security Licence – Class 2", "RSA (Responsible Service of Alcohol)", "RSG (Responsible Service of Gambling)", "Working with Children Check", "NDIS Worker Screening", "National Police Check"],
  "Mining & Resources": ["Surface Extraction Supervisor", "Underground Mining Certification", "Coal Mining (SIMTARS)", "Radiation Safety Licence"],
  "General Competencies": ["Manual Handling", "Chemical Handling / Hazmat", "Noise Awareness", "Food Safety Supervisor", "VOC – Site Specific Competency", "Lead Awareness"],
};

// ─── US Tickets ───────────────────────────────────────────────────────────────
const US_TICKETS: Record<string, string[]> = {
  "OSHA Safety": ["OSHA 10-Hour – Construction", "OSHA 30-Hour – Construction", "OSHA 10-Hour – General Industry", "OSHA 30-Hour – General Industry", "OSHA 510 – Construction Standards", "OSHA 500 – Trainer of OSHA Outreach Trainers"],
  "First Aid & Emergency": ["CPR / AED Certified", "First Aid / CPR / AED (Red Cross)", "First Aid / CPR / AED (AHA)", "Emergency Medical Technician (EMT)", "Mental Health First Aid", "Wilderness First Aid"],
  "Crane Certification (NCCCO)": ["Telescopic Boom Crane – Fixed Cab", "Telescopic Boom Crane – Swing Cab", "Lattice Boom Crawler Crane", "Lattice Boom Truck Crane", "Tower Crane", "Articulating Crane", "Overhead / Bridge Crane", "Rigger Level I", "Rigger Level II", "Signal Person Qualification"],
  "Forklift & Aerial": ["Forklift Operator Certification", "Boom Lift / AWP Certification", "Scissor Lift Certification", "Telehandler Certification"],
  "Confined Space & Hazmat": ["Confined Space Entry", "Confined Space Rescue", "HAZWOPER 8-Hour (Refresher)", "HAZWOPER 24-Hour", "HAZWOPER 40-Hour", "Hazardous Materials Awareness", "Lead Abatement Worker", "Asbestos Abatement Worker"],
  "Fall Protection & Scaffolding": ["Fall Protection Competent Person", "Fall Arrest & Restraint Systems", "Scaffolding Competent Person", "Scaffolding Erector / Dismantler"],
  "Rigging & Signaling": ["Rigging & Signaling Certification", "Crane Signal Person"],
  "Electrical": ["Journeyman Electrician License", "Master Electrician License", "Electrical Apprentice License", "NFPA 70E – Electrical Safety", "Solar PV Installer (NABCEP)", "Low Voltage Technician License"],
  "Plumbing & HVAC": ["Journeyman Plumber License", "Master Plumber License", "Plumbing Apprentice License", "EPA 608 – Universal (All Types)", "EPA 608 – Type I (Small Appliances)", "EPA 608 – Type II (High-Pressure)", "EPA 608 – Type III (Low-Pressure)", "Gas Fitter License", "HVAC Excellence Certification"],
  "Welding (AWS)": ["AWS D1.1 – Structural Steel", "AWS D1.2 – Structural Aluminum", "AWS D1.6 – Stainless Steel", "AWS Certified Welding Inspector (CWI)", "Pipe Welding Certification"],
  "Commercial Driver (CDL)": ["CDL – Class A", "CDL – Class B", "CDL – Class C", "CDL – Hazmat Endorsement", "CDL – Tanker Endorsement", "CDL – Doubles / Triples Endorsement", "CDL – Passenger Endorsement"],
  "Trade Licenses": ["General Contractor License", "Residential Contractor License", "Commercial Contractor License", "Roofing Contractor License", "Home Improvement License", "Pesticide Applicator License", "Security Guard License"],
  "Excavation & Trenching": ["Excavation Competent Person", "Trenching Safety", "Underground Utilities Locator (811 Certified)"],
  "Mining & Energy": ["MSHA Part 46 – Surface Mining", "MSHA Part 48 – Underground Mining", "Radiation Safety Officer", "Blasting / Explosives License"],
  "Background & Compliance": ["Background Check Cleared", "Drug Test Cleared", "Working with Children Clearance", "TSA PreCheck / Security Clearance"],
  "General Competencies": ["Competent Person – General Safety", "Bloodborne Pathogens", "Personal Protective Equipment (PPE)", "Manual Handling / Ergonomics", "Toolbox Talks Facilitator"],
};

// ─── Insurance options ────────────────────────────────────────────────────────
const AU_INSURANCE = ["Public Liability", "Workers Comp", "Tools Insurance", "Vehicle Insurance"];
const US_INSURANCE = ["General Liability", "Workers' Compensation", "Commercial Auto", "Tools & Equipment", "Builder's Risk"];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type TicketEntry = {
  id: string;
  name: string;
  expiry: string;
  photoDataUrl: string;
};

const genId = () => Math.random().toString(36).slice(2, 10);

function formatAbn(v: string, isUS: boolean) {
  const digits = v.replace(/\D/g, "");
  if (isUS) {
    // EIN: XX-XXXXXXX
    const d = digits.slice(0, 9);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}-${d.slice(2)}`;
  }
  // ABN: XX XXX XXX XXX
  const d = digits.slice(0, 11);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8), d.slice(8, 11)].filter(Boolean);
  return parts.join(" ");
}

export default function ContractorEditProfile() {
  const { user, refreshUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const toggleAvailability = useToggleAvailability();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get("onboarding") === "true";
  const { market } = useMarket();
  const isUS = market.code === "US";

  // Market-specific data
  const TRADES_BY_CATEGORY = isUS ? US_TRADES : AU_TRADES;
  const CATEGORY_KEYS = Object.keys(TRADES_BY_CATEGORY);
  const TICKETS_BY_CATEGORY = isUS ? US_TICKETS : AU_TICKETS;
  const TICKET_CATEGORY_KEYS = Object.keys(TICKETS_BY_CATEGORY);
  const INSURANCE_OPTIONS = isUS ? US_INSURANCE : AU_INSURANCE;

  const [form, setForm] = useState({
    name: user?.name || "",
    abn: (user as any)?.abn || "",
    trades: (user as any)?.trades || (user?.trade ? [user.trade] : []) as string[],
    location: user?.location || "",
    hourlyRate: user?.hourlyRate?.toString() || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    phone: user?.phone || "",
    insurance: (user as any)?.insurance || [] as string[],
    availableDays: (user as any)?.availableDays || [] as string[],
  });

  const [ticketEntries, setTicketEntries] = useState<TicketEntry[]>(() => {
    const raw = (user as any)?.tickets ?? [];
    return (raw as unknown[]).map((t): TicketEntry => {
      if (typeof t === "object" && t !== null && "name" in (t as object)) {
        const obj = t as Record<string, string>;
        return { id: genId(), name: obj.name ?? "", expiry: obj.expiry ?? "", photoDataUrl: obj.photoDataUrl ?? "" };
      }
      return { id: genId(), name: String(t), expiry: "", photoDataUrl: "" };
    });
  });

  const [ticketMode, setTicketMode] = useState<"list" | "other">("list");
  const [ticketCat, setTicketCat] = useState("");
  const [ticketName, setTicketName] = useState("");
  const [ticketOther, setTicketOther] = useState("");
  const [ticketExpiry, setTicketExpiry] = useState("");
  const [ticketPhoto, setTicketPhoto] = useState("");
  const ticketPhotoRef = useRef<HTMLInputElement>(null);

  const [pickerCategory, setPickerCategory] = useState("");
  const [pickerSpecialisation, setPickerSpecialisation] = useState("");

  const toggleInArray = (key: "insurance" | "availableDays", value: string) => {
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

  const addTicket = () => {
    const name = ticketMode === "other" ? ticketOther.trim() : ticketName;
    if (!name) return;
    if (ticketEntries.some((t) => t.name === name)) {
      toast({ title: "Already added", description: "That ticket is already in your list.", variant: "destructive" });
      return;
    }
    setTicketEntries((prev) => [...prev, { id: genId(), name, expiry: ticketExpiry, photoDataUrl: ticketPhoto }]);
    setTicketCat(""); setTicketName(""); setTicketOther(""); setTicketExpiry(""); setTicketPhoto("");
    if (ticketPhotoRef.current) ticketPhotoRef.current.value = "";
  };

  const removeTicket = (id: string) => {
    setTicketEntries((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTicketPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setTicketPhoto((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  };

  const abnDigits = form.abn.replace(/\D/g, "");
  const abnValid = isUS ? abnDigits.length === 9 : abnDigits.length === 11;
  const abnLabel = isUS ? "EIN" : "ABN";
  const abnPlaceholder = isUS ? "XX-XXXXXXX" : "XX XXX XXX XXX";
  const abnHint = isUS ? "9 digits" : "11 digits";
  const locationLabel = isUS ? "City & State" : "Location";
  const locationPlaceholder = isUS ? "e.g. Austin, TX" : "e.g. Sydney, NSW";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) return;
    if (form.abn && !abnValid) {
      toast({ title: `Invalid ${abnLabel}`, description: `${abnLabel} must be ${abnHint}.`, variant: "destructive" });
      return;
    }
    if (form.trades.length === 0) {
      toast({ title: "Add at least one trade", description: "Select your category and specialisation.", variant: "destructive" });
      return;
    }
    try {
      const primaryTrade = form.trades[0]?.split(" > ").pop() || form.trades[0] || "";
      await updateProfile.mutateAsync({
        id: userId,
        data: {
          name: form.name,
          trade: primaryTrade,
          trades: form.trades,
          abn: form.abn.replace(/\D/g, ""),
          location: form.location,
          hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
          bio: form.bio,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
          phone: form.phone,
          tickets: ticketEntries.map((t) => ({ name: t.name, expiry: t.expiry, photoDataUrl: t.photoDataUrl })),
          insurance: form.insurance,
          availableDays: form.availableDays,
          market: market.code,
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
              <Switch checked={user?.isActive ?? false} onCheckedChange={handleToggleAvailability} disabled={toggleAvailability.isPending} />
            </div>
          </div>
        </div>

        <VerificationDocumentsUpload />

        <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 card-shadow">
          <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
          <div className="mt-4">
            <ProfileImageUpload />
          </div>

          <div className="mt-6 space-y-6">
            {/* Name + ABN/EIN */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{abnLabel} <span className="text-xs text-muted-foreground">({abnHint})</span></Label>
                <Input
                  value={form.abn}
                  onChange={(e) => setForm({ ...form, abn: formatAbn(e.target.value, isUS) })}
                  placeholder={abnPlaceholder}
                  inputMode="numeric"
                />
                {form.abn && !abnValid && <p className="text-xs text-destructive">Must be {abnHint}.</p>}
              </div>
            </div>

            {/* Trades */}
            <div className="space-y-3">
              <Label>Trades <span className="text-xs text-muted-foreground">(add one or more)</span></Label>
              {form.trades.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.trades.map((trade) => (
                    <span key={trade} className="inline-flex items-center gap-1.5 rounded-full bg-[#2E3192] text-white text-sm px-3 py-1.5 font-medium">
                      {trade}
                      <button type="button" onClick={() => removeTrade(trade)} className="rounded-full hover:bg-white/20 p-0.5 transition" aria-label={`Remove ${trade}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                      {CATEGORY_KEYS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
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
                      {pickerCategory && TRADES_BY_CATEGORY[pickerCategory]?.map((spec) => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                  </div>
                </div>
                <Button type="button" size="sm" onClick={addTrade} disabled={!pickerCategory || !pickerSpecialisation} className="bg-[#2E3192] hover:bg-[#1E2270] disabled:opacity-40">
                  <Plus className="h-4 w-4 mr-1" />
                  {form.trades.length === 0 ? "Add trade" : "Add another trade"}
                </Button>
              </div>
              {form.trades.length === 0 && <p className="text-xs text-destructive">Add at least one trade to continue.</p>}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>{locationLabel}</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder={locationPlaceholder} />
            </div>

            {/* Rate + Phone */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hourly Rate ({market.currencySymbol}{market.currency})</Label>
                <Input type="number" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Describe your experience and services..." />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. Wiring, Lighting, Solar" />
            </div>

            {/* Tickets & Certifications */}
            <div className="space-y-3">
              <Label>Tickets &amp; Certifications</Label>
              {ticketEntries.length > 0 && (
                <div className="space-y-2">
                  {ticketEntries.map((ticket) => (
                    <div key={ticket.id} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      {ticket.photoDataUrl && (
                        <img src={ticket.photoDataUrl} alt="Ticket" className="h-12 w-12 rounded object-cover shrink-0 border border-amber-200" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800 leading-tight">{ticket.name}</p>
                        {ticket.expiry && <p className="text-xs text-muted-foreground mt-0.5">Expires: {ticket.expiry}</p>}
                      </div>
                      <button type="button" onClick={() => removeTicket(ticket.id)} className="rounded-full p-0.5 hover:bg-amber-200 transition shrink-0" aria-label={`Remove ${ticket.name}`}>
                        <X className="h-3.5 w-3.5 text-amber-700" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTicketMode("list"); setTicketOther(""); }}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${ticketMode === "list" ? "bg-[#2E3192] text-white border-[#2E3192]" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                  >
                    Select from list
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTicketMode("other"); setTicketCat(""); setTicketName(""); }}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${ticketMode === "other" ? "bg-[#2E3192] text-white border-[#2E3192]" : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"}`}
                  >
                    Other (not listed)
                  </button>
                </div>

                {ticketMode === "list" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</label>
                      <select
                        value={ticketCat}
                        onChange={(e) => { setTicketCat(e.target.value); setTicketName(""); }}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/40"
                      >
                        <option value="">Select category...</option>
                        {TICKET_CATEGORY_KEYS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certification</label>
                      <select
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        disabled={!ticketCat}
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E3192]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">Select certification...</option>
                        {ticketCat && TICKETS_BY_CATEGORY[ticketCat]?.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Certification name</label>
                    <Input value={ticketOther} onChange={(e) => setTicketOther(e.target.value)} placeholder={isUS ? "e.g. NCCER Core Curriculum" : "e.g. Rigging Advanced – Special Class"} />
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Expiry date <span className="text-slate-400 font-normal normal-case">(optional)</span>
                    </label>
                    <Input type="date" value={ticketExpiry} onChange={(e) => setTicketExpiry(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Photo of {isUS ? "certification" : "ticket"} <span className="text-slate-400 font-normal normal-case">(optional)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input ref={ticketPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleTicketPhoto} />
                      <button
                        type="button"
                        onClick={() => ticketPhotoRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 hover:border-slate-400 transition"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {ticketPhoto ? "Change photo" : "Upload photo"}
                      </button>
                      {ticketPhoto && <img src={ticketPhoto} alt="preview" className="h-8 w-8 rounded object-cover border" />}
                    </div>
                  </div>
                </div>

                <Button
                  type="button" size="sm" onClick={addTicket}
                  disabled={ticketMode === "list" ? (!ticketCat || !ticketName) : !ticketOther.trim()}
                  className="bg-[#2E3192] hover:bg-[#1E2270] disabled:opacity-40"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {ticketEntries.length === 0 ? (isUS ? "Add certification" : "Add ticket") : (isUS ? "Add another certification" : "Add another ticket")}
                </Button>
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-2">
              <Label>Insurance held</Label>
              <div className="flex flex-wrap gap-2">
                {INSURANCE_OPTIONS.map((t) => {
                  const active = form.insurance.includes(t);
                  return (
                    <button key={t} type="button" onClick={() => toggleInArray("insurance", t)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"}`}>
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
                    <button key={d} type="button" onClick={() => toggleInArray("availableDays", d)}
                      className={`rounded-md border px-4 py-2 text-sm font-medium transition ${active ? "bg-[#2E3192] text-white border-[#2E3192]" : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"}`}>
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
