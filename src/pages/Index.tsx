import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hammer, HardHat, ArrowRight, Search, MessageSquare, Star, Users } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-lg text-foreground">SubbyMe</span>
        <div className="flex items-center gap-4">
          <Link to="/contractors" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            Find Contractors
          </Link>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col">

        {/* Hero */}
        <section className="flex items-center justify-center px-6 pt-10 pb-12">
          <div className="w-full max-w-4xl mx-auto text-center space-y-8">
            <div className="flex flex-col items-center gap-3">
              <img src="/logo.svg" alt="SubbyMe" className="h-20 md:h-28 w-auto"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">SubbyMe</h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              The home of trusted contractors — free for builders, fair monthly listing for subbies.
              Built for Australian and American trades.
            </p>

          </div>
        </section>

        {/* How it works */}
        <section className="py-14 bg-muted/40 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-10">How SubbyMe Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  1
                </div>
                <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto">
                  <HardHat className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Contractors list their trade</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your profile with your trade, tickets, rates, and availability in minutes. One low monthly fee — cancel any time.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  2
                </div>
                <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Builders search for free</h3>
                <p className="text-sm text-muted-foreground">
                  Filter by trade, location, availability, and rating. No middlemen, no commissions — just direct contact.
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto">
                  3
                </div>
                <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Message and book direct</h3>
                <p className="text-sm text-muted-foreground">
                  Chat directly, agree on terms, and leave reviews after the job. Simple, fast, and fair.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-10 px-6 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-5 w-5 opacity-80" />
                <span className="text-2xl font-extrabold">AU + US</span>
              </div>
              <p className="text-sm opacity-80">Two markets</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Hammer className="h-5 w-5 opacity-80" />
                <span className="text-2xl font-extrabold">50+</span>
              </div>
              <p className="text-sm opacity-80">Trade categories</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="h-5 w-5 opacity-80" />
                <span className="text-2xl font-extrabold">Free</span>
              </div>
              <p className="text-sm opacity-80">For builders to search</p>
            </div>
          </div>
        </section>

        {/* Role cards */}
        <section className="py-14 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">Get started today</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contractor */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <HardHat className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">I'm a Contractor</h2>
                <p className="text-sm text-muted-foreground">
                  List your trade and get hired by builders. Founding-member pricing — first 100 subbies locked in forever.
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

              {/* Builder */}
              <div className="rounded-2xl border bg-card p-8 shadow-sm hover:shadow-md transition flex flex-col items-center text-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Hammer className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">I'm a Builder / Client</h2>
                <p className="text-sm text-muted-foreground">
                  Free to join. Find vetted contractors fast — message, book, and rate after the job.
                </p>
                <div className="flex flex-col gap-2 w-full pt-2">
                  <Button size="lg" variant="outline" className="w-full" onClick={() => navigate("/onboarding/country?role=client")}>
                    Sign up free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link to="/login?role=client" className="text-sm text-muted-foreground hover:text-primary">
                    Already a member? Sign in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-muted-foreground border-t">
        <span>© {new Date().getFullYear()} SubbyMe — Built for Australian and American trades</span>
      </footer>
    </div>
  );
}
