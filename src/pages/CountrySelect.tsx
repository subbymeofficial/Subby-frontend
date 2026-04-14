// Country selector — pick AU or US after choosing a role.
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useMarket } from "@/context/MarketContext";
import { ArrowLeft } from "lucide-react";

export default function CountrySelect() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get("role") || "contractor";
  const { setMarket } = useMarket();

  const choose = (market: "AU" | "US") => {
    try { setMarket(market); } catch { /* ignore */ }
    navigate(`/register?role=${role}&market=${market}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <Link to="/login" className="text-sm font-medium text-primary hover:underline">Sign in</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold">Where are you working?</h1>
            <p className="text-muted-foreground">
              Pick your country so we set the right currency, tax rules and trade categories.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 pt-2">
            <button
              onClick={() => choose("AU")}
              className="group rounded-2xl border-2 border-transparent hover:border-primary bg-card p-10 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-4"
            >
              <span className="text-7xl" aria-hidden>🇦🇺</span>
              <span className="text-xl font-bold">Australia</span>
              <span className="text-xs text-muted-foreground">AUD · GST · ABN</span>
            </button>

            <button
              onClick={() => choose("US")}
              className="group rounded-2xl border-2 border-transparent hover:border-primary bg-card p-10 shadow-sm hover:shadow-lg transition flex flex-col items-center gap-4"
            >
              <span className="text-7xl" aria-hidden>🇺🇸</span>
              <span className="text-xl font-bold">United States</span>
              <span className="text-xs text-muted-foreground">USD · State tax · EIN/SSN</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
