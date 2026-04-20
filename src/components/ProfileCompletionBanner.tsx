import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserCog, X, CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * ProfileCompletionBanner
 *
 * Shows on the Contractor Dashboard when the logged-in user's profile is
 * less than 100% complete. Auto-hides when complete. Nudges users to finish
 * setup without making them hunt for Edit Profile.
 *
 * Drop-in usage (no props needed):
 *   <ProfileCompletionBanner />
 */

type Field = {
  key: string;
  label: string;
  weight: number; // 3 = critical, 2 = important, 1 = nice-to-have
  isFilled: (user: any) => boolean;
};

const EDIT_PROFILE_PATH = "/dashboard/contractor/profile";

const FIELDS: Field[] = [
  {
    key: "profileImage",
    label: "Profile photo",
    weight: 3,
    isFilled: (u) => Boolean(u?.profileImage?.url || u?.avatar),
  },
  {
    key: "phone",
    label: "Phone number",
    weight: 3,
    isFilled: (u) => typeof u?.phone === "string" && u.phone.trim().length >= 6,
  },
  {
    key: "location",
    label: "Service location",
    weight: 3,
    isFilled: (u) =>
      typeof u?.location === "string" && u.location.trim().length > 0,
  },
  {
    key: "bio",
    label: "Short bio",
    weight: 3,
    isFilled: (u) => typeof u?.bio === "string" && u.bio.trim().length >= 40,
  },
  {
    key: "trade",
    label: "Trade",
    weight: 3,
    isFilled: (u) =>
      (typeof u?.trade === "string" && u.trade.trim().length > 0) ||
      Boolean(u?.tradeId),
  },
  {
    key: "skills",
    label: "Skills & specialties",
    weight: 2,
    isFilled: (u) => Array.isArray(u?.skills) && u.skills.length > 0,
  },
  {
    key: "hourlyRate",
    label: "Hourly rate",
    weight: 1,
    isFilled: (u) => typeof u?.hourlyRate === "number" && u.hourlyRate > 0,
  },
  {
    key: "availability",
    label: "Availability",
    weight: 1,
    isFilled: (u) => Boolean(u?.availability?.isAvailable),
  },
];

function computeCompleteness(user: any) {
  if (!user) {
    return {
      percent: 0,
      missing: FIELDS,
      isComplete: false,
      nextStep: FIELDS[0],
    };
  }
  let earned = 0;
  let total = 0;
  const missing: Field[] = [];
  for (const f of FIELDS) {
    total += f.weight;
    if (f.isFilled(user)) earned += f.weight;
    else missing.push(f);
  }
  missing.sort((a, b) => b.weight - a.weight);
  const percent = total === 0 ? 100 : Math.round((earned / total) * 100);
  return {
    percent,
    missing,
    isComplete: percent >= 100,
    nextStep: missing[0] ?? null,
  };
}

export default function ProfileCompletionBanner() {
  const { user } = useAuth() as { user: any };
  const [dismissed, setDismissed] = useState(false);

  const { percent, missing, isComplete, nextStep } = useMemo(
    () => computeCompleteness(user),
    [user],
  );

  if (!user || isComplete || dismissed) return null;

  const topThree = missing.slice(0, 3);

  // Tone shifts as user progresses
  const tone =
    percent < 30
      ? {
          border: "border-yellow-500/40",
          bg: "bg-yellow-50/60 dark:bg-yellow-900/10",
          bar: "bg-yellow-500",
          badge: "bg-yellow-500 text-white",
          ring: "stroke-yellow-500",
        }
      : percent < 70
      ? {
          border: "border-primary/40",
          bg: "bg-primary/5",
          bar: "bg-primary",
          badge: "bg-primary text-primary-foreground",
          ring: "stroke-primary",
        }
      : {
          border: "border-success/40",
          bg: "bg-success/10",
          bar: "bg-success",
          badge: "bg-success text-white",
          ring: "stroke-success",
        };

  const headline =
    percent < 30
      ? "Finish your profile to start getting hired"
      : percent < 70
      ? "You're getting there - finish your profile to unlock job leads"
      : "Almost done! Complete your profile to stand out";

  const subcopy =
    percent < 30
      ? "Contractors with a complete profile get hired 3x more often. It takes about 4 minutes."
      : percent < 70
      ? "A few quick details left and your profile will appear in search results."
      : "One or two final touches and you're all set.";

  const ctaLabel = nextStep
    ? `Add ${nextStep.label.toLowerCase()}`
    : "Finish setup";

  return (
    <div
      className={`relative mb-6 rounded-lg border ${tone.border} ${tone.bg} p-4 sm:p-5`}
      role="region"
      aria-label="Profile completion progress"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss for now"
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-4">
        {/* Circular % meter */}
        <PercentCircle percent={percent} ringClass={tone.ring} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground sm:text-lg">
              {headline}
            </h2>
            <span
              className={`rounded-full ${tone.badge} px-2 py-0.5 text-[11px] font-bold`}
            >
              {percent}% complete
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">{subcopy}</p>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full ${tone.bar} transition-all duration-500 ease-out`}
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Top 3 missing items as checklist */}
          {topThree.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {topThree.map((f) => (
                <li
                  key={f.key}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <Circle
                    size={14}
                    className="mt-0.5 shrink-0 text-muted-foreground"
                  />
                  <span>
                    {f.label}
                    {f.weight === 3 && (
                      <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-destructive">
                        Required
                      </span>
                    )}
                  </span>
                </li>
              ))}
              {missing.length > 3 && (
                <li className="pt-1 text-xs font-medium text-muted-foreground">
                  + {missing.length - 3} more to complete
                </li>
              )}
            </ul>
          )}

          {/* CTAs */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to={EDIT_PROFILE_PATH}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <UserCog size={16} />
              {ctaLabel}
              <ArrowRight size={14} />
            </Link>
            <Link
              to={EDIT_PROFILE_PATH}
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Go to full edit profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PercentCircle({
  percent,
  ringClass,
}: {
  percent: number;
  ringClass: string;
}) {
  const size = 56;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className="relative hidden h-14 w-14 shrink-0 sm:block"
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-muted"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={ringClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <CheckCircle2
          size={14}
          className="absolute text-success opacity-0"
          style={{ opacity: percent >= 100 ? 1 : 0 }}
        />
        <span
          className="text-xs font-bold text-foreground"
          style={{ opacity: percent >= 100 ? 0 : 1 }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
