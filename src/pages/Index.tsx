import { Link } from "react-router-dom";
import { HeroSearch } from "@/components/HeroSearch";
import { ContractorCard } from "@/components/ContractorCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { MissionSection } from "@/components/MissionSection";
import { ReviewsSlider } from "@/components/ReviewsSlider";
import { useContractors, useCategories } from "@/hooks/use-api";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data, isLoading } = useContractors({ limit: 4, isVerified: true });
  const { data: categories } = useCategories();
  const featured = data?.contractors ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b bg-secondary py-16 sm:py-24">
        <div className="container-main text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Skilled Help, <span className="text-primary">On Demand.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Find trusted local contractors for any job. From plumbing to painting, SubbyMe connects you with verified tradespeople in your area.
          </p>
          <div className="mt-8">
            <HeroSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Sign Up</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      <MissionSection />

      <section className="py-16">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-foreground">Popular Trade Categories</h2>
          <p className="mt-1 text-muted-foreground">Browse by trade to find the right professional</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(categories ?? []).map((cat) => (
              <Link
                key={cat._id}
                to={`/contractors?category=${cat.name}`}
                className="group rounded-lg border bg-card p-5 text-center card-shadow transition-all hover:card-shadow-hover hover:border-primary/30"
              >
                {cat.iconImage?.url ? (
                  <img src={cat.iconImage.url} alt={cat.name} className="mx-auto h-10 w-10 object-contain" />
                ) : (
                  <span className="text-3xl">{cat.icon || "📦"}</span>
                )}
                <h3 className="mt-2 font-semibold text-card-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-secondary py-16">
        <div className="container-main">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Featured Contractors</h2>
              <p className="mt-1 text-muted-foreground">Top-rated verified professionals</p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/contractors">View All <ArrowRight size={16} className="ml-1" /></Link>
            </Button>
          </div>
          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : featured.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No contractors available yet. Be the first to join!</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {featured.map((c) => (
                  <ContractorCard key={c._id} contractor={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ReviewsSlider />
      <HowItWorks />
      <FAQ />

      <section className="py-16">
        <div className="container-main text-center">
          <div className="mx-auto max-w-2xl rounded-2xl bg-primary p-10 text-primary-foreground">
            <h2 className="text-3xl font-bold">Are you a contractor?</h2>
            <p className="mt-3 text-primary-foreground/80">
              Join SubbyMe and connect with clients looking for your skills. From just $10/week.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6">
              <Link to="/register">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
