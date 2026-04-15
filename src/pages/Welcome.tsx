import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

/**
 * Post-signup welcome screen.
 * Route: /onboarding/welcome
 *
 * First thing a freshly-registered contractor sees. Celebrates the sign-up,
 * sets expectations, gives one clear CTA to start the profile wizard.
 *
 * Accepts ?name=Reece&role=contractor in the URL so Register can hand off
 * the user's first name without a dependency on AuthContext shape.
 */
export default function Welcome() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const firstName = (params.get("name") || "mate").trim();
  const role = params.get("role") || "contractor";

  const startPath =
    role === "hirer" || role === "client"
      ? "/dashboard/client/edit-profile"
      : "/dashboard/contractor/subscription";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl text-center">
        <img
          src="/logo.svg"
          alt="SubbyMe"
          className="mx-auto mb-6 h-16 w-16"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        <h1 className="text-4xl font-black tracking-tight text-[#2E3192]">
          Welcome to SubbyMe, {firstName} 👋
        </h1>
        <p className="mt-3 text-slate-600 max-w-lg mx-auto">
          Let's build a profile builders actually call back. It takes about
          5 minutes — you can come back and edit anything later.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            size="lg"
            className="bg-[#2E3192] hover:bg-[#1E2270] text-white font-semibold"
            onClick={() => navigate(startPath)}
          >
            Start profile setup →
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-semibold"
            onClick={() => navigate(startPath)}
          >
            Skip for now
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Profiles with photos &amp; licence verified get{" "}
          <span className="font-semibold text-[#2E3192]">4.2× more quote requests</span>.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-3 text-left">
          <StepCard label="Step 1" title="Your trade" body="Pick your main trade + up to 5 specialties." />
          <StepCard label="Step 2" title="Where you work" body="Home postcode and how far you'll travel." />
          <StepCard label="Step 3" title="Prove the work" body="Licence, insurance and safety tickets." />
        </div>
      </div>

      <div className="mt-10 text-xs text-slate-400">
        Already set up?{" "}
        <Link to={startPath} className="underline text-slate-500">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

function StepCard({ label, title, body }: { label: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] tracking-widest font-bold text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-1 font-semibold text-slate-800">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{body}</div>
    </div>
  );
}
