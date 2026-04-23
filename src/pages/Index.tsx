import { Link, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, HardHat, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Root auth gateway.
 *
 * SubbyMe is a members-only platform — no one reaches any platform content
 * without signing in. This page is what every unauthenticated visitor sees:
 * a minimal role picker + sign-in link + legal footer. No marketing copy,
 * no stats, no contractor teasers, no "How it works". Members get bounced
 * straight to their dashboard.
 */
export default function Index() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Signed-in users skip the gateway — go straight to their dashboard.
  if (isAuthenticated && user) {
    const dest =
      user.role === "admin"
        ? "/admin"
        : user.role === "contractor"
        ? "/dashboard/contractor"
        : "/dashboard/client";
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl mx-auto">

          {/* Brand mark */}
          <div className="flex flex-col items-center gap-4 text-center">
            <img
              src="/logo.svg"
              alt="SubbyMe"
              className="h-24 md:h-32 w-auto"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">SubbyMe</h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Members-only marketplace for builders and subcontractors. Create an account to get started.
            </p>
          </div>

          {/* Role picker */}
          <div className="grid gap-6 md:grid-cols-2 mt-10">
            {/* Contractor */}
            <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <HardHat className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">I'm a Subcontractor</h2>
              <p className="text-sm text-muted-foreground">
                List your trade and get hired.
              </p>
              <Button
                size="lg"
                className="w-full min-h-[44px]"
                onClick={() => navigate("/onboarding/country?role=contractor")}
              >
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Builder */}
            <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Hammer className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold">I'm a Builder / Client</h2>
              <p className="text-sm text-muted-foreground">
                Hire verified trades.
              </p>
              <Button
                size="lg"
                variant="outline"
                className="w-full min-h-[44px]"
                onClick={() => navigate("/onboarding/country?role=client")}
              >
                Create account <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Sign in for existing members */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-primary underline underline-offset-2 hover:opacity-80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Minimal legal footer. Only links are the two legally-required public pages. */}
      <footer className="px-6 py-6 text-center text-xs text-muted-foreground border-t">
        <div className="space-x-4">
          <Link to="/privacy" className="hover:text-primary underline-offset-2 hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:text-primary underline-offset-2 hover:underline">Terms</Link>
        </div>
        <div className="mt-2">© {new Date().getFullYear()} SubbyMe</div>
      </footer>
    </div>
  );
}
