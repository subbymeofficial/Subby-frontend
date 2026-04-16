// Splash landing — minimal: logo + value prop + role cards (Subcontractor / Builder).
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, HardHat, ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Top bar — minimal: just sign-in link */}
      <header className="px-6 py-4 flex items-center justify-end">
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-4xl mx-auto text-center space-y-10">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img
              src="/logo.svg"
              alt="SubbyMe"
              className="h-20 md:h-28 w-auto"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              SubbyMe
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            The home of trusted contractors — free for builders, fair monthly listing for subbies. Built for Australian and American trades.
          </p>

          {/* Two role cards */}
          <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto pt-4">
            {/* Subcontractor */}
            <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <HardHat className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">I'm a Contractor</h2>
              <p className="text-sm text-muted-foreground">
                List your trade and get hired by builders nationwide. Founding-member pricing — first 100 subbies locked in.
              </p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <Button size="lg" className="w-full" onClick={() => navigate("/onboarding/country?role=contractor")}>
                  Sign up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/login?role=contractor" className="text-sm text-muted-foreground hover:text-primary">
                  Already a member? Sign in
                </Link>
              </div>
            </div>

            {/* Builder / Hirer */}
            <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Hammer className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">I'm a Builder / Client</h2>
              <p className="text-sm text-muted-foreground">
                Free to join. Find vetted contractors fast — message, book and rate after the job.
              </p>
              <div className="flex flex-col gap-2 w-full pt-2">
                <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/onboarding/country?role=client")}>
                  Sign up <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Link to="/login?role=client" className="text-sm text-muted-foreground hover:text-primary">
                  Already a member? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} SubbyMe</span>
      </footer>
    </div>
  );
}
