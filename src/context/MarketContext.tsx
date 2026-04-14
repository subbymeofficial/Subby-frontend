// Global AU/US market state. Persists selection in localStorage.
// Detect from Accept-Language / Cloudflare geo header on first visit server-side if possible,
// otherwise fall back to AU and let user flip via header toggle.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Market = "AU" | "US";

export interface MarketInfo {
  code: Market;
  name: string;
  flag: string;
  currency: "AUD" | "USD";
  currencySymbol: "$";
  priceMonthly: number;
  priceYearly: number;
  postcodeLabel: string;
  postcodePlaceholder: string;
  phone: string;
  supportHours: string;
}

export const MARKETS: Record<Market, MarketInfo> = {
  AU: {
    code: "AU",
    name: "Australia",
    flag: "🇦🇺",
    currency: "AUD",
    currencySymbol: "$",
    priceMonthly: 30,
    priceYearly: 300,
    postcodeLabel: "Postcode or suburb",
    postcodePlaceholder: "e.g. 2000 or Sydney NSW",
    phone: "1300 782 296",
    supportHours: "Mon–Fri 9am–6pm AEDT",
  },
  US: {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    currency: "USD",
    currencySymbol: "$",
    priceMonthly: 20,
    priceYearly: 200,
    postcodeLabel: "ZIP code or city",
    postcodePlaceholder: "e.g. 78701 or Austin TX",
    phone: "+1 (737) 555-0190",
    supportHours: "Mon–Fri 9am–6pm CT",
  },
};

interface MarketContextValue {
  market: MarketInfo;
  setMarket: (m: Market) => void;
  hasChosen: boolean;
}

const MarketContext = createContext<MarketContextValue | null>(null);
const LS_KEY = "subbyme_market";

export function MarketProvider({ children }: { children: ReactNode }) {
  const [marketCode, setMarketCode] = useState<Market>("AU");
  const [hasChosen, setHasChosen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) as Market | null;
    if (stored && (stored === "AU" || stored === "US")) {
      setMarketCode(stored);
      setHasChosen(true);
    } else {
      // Auto-detect from browser language as a reasonable first guess
      const lang = navigator.language || "en-AU";
      if (lang.includes("US") || lang.includes("en-US")) {
        setMarketCode("US");
      }
    }
  }, []);

  const setMarket = (m: Market) => {
    setMarketCode(m);
    setHasChosen(true);
    localStorage.setItem(LS_KEY, m);
  };

  return (
    <MarketContext.Provider value={{ market: MARKETS[marketCode], setMarket, hasChosen }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside <MarketProvider>");
  return ctx;
}
