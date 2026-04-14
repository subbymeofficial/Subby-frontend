// Trade categories + trade list for SubbyMe.
// Full 188-trade list is in /implementation-pack/src/data/trades.ts in your SubbyMe folder.
// This stub gives the types + a handful of categories so the app builds.
// Replace with the full file before launch.

export type Market = "AU" | "US" | "BOTH";

export interface Trade {
  name: string;
  slug: string;
  description: string;
  market: Market;
}

export interface TradeCategory {
  name: string;
  slug: string;
  icon: string;
  trades: Trade[];
  count: number;
}

export const TRADE_CATEGORIES: TradeCategory[] = [
  {
    name: "Building", slug: "building", icon: "HardHat", count: 3,
    trades: [
      { name: "Carpenter", slug: "carpenter", description: "Framing, fit-out, formwork", market: "BOTH" },
      { name: "Roofer", slug: "roofer", description: "Metal, tile, flat roofing, gutters", market: "BOTH" },
      { name: "Concreter", slug: "concreter", description: "Slabs, footings, driveways", market: "BOTH" },
    ]
  },
  {
    name: "Electrician", slug: "electrician", icon: "Zap", count: 2,
    trades: [
      { name: "Residential", slug: "residential", description: "Residential wiring, switchboards, lighting", market: "BOTH" },
      { name: "Commercial", slug: "commercial", description: "Commercial fit-outs, data, power", market: "BOTH" },
    ]
  },
  {
    name: "Plumbing", slug: "plumbing", icon: "Droplets", count: 2,
    trades: [
      { name: "Residential", slug: "residential", description: "Taps, toilets, hot water", market: "BOTH" },
      { name: "Gas Fitter", slug: "gas-fitter", description: "Gas line installation and compliance", market: "BOTH" },
    ]
  },
  {
    name: "Owner Operators", slug: "owner-operators", icon: "Truck", count: 2,
    trades: [
      { name: "Excavator 2.6-5t", slug: "excavator-2-6-5t", description: "Residential, light civil, pools", market: "BOTH" },
      { name: "Bobcat", slug: "posi-track-bobcat", description: "Skid steer - levelling, clean-up", market: "BOTH" },
    ]
  },
];

export const ALL_TRADES: Trade[] = TRADE_CATEGORIES.flatMap(c => c.trades);

export function getTradesByMarket(market: "AU" | "US"): Trade[] {
  return ALL_TRADES.filter(t => t.market === market || t.market === "BOTH");
}

export function findCategoryBySlug(s: string): TradeCategory | undefined {
  return TRADE_CATEGORIES.find(c => c.slug === s);
}
