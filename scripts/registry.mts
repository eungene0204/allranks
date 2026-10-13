import { bigMac } from "./sources/bigmac.mts";
import { wikipediaSpeed } from "./sources/wikipedia-speed.mts";
import { worldBank } from "./sources/worldbank.mts";
import type { Pipeline } from "./lib/types.mts";

/**
 * Rankings whose numbers are fetched automatically. To add one: write (or reuse) a source adapter that
 * returns `Fetched`, then register it here with its metadata.
 *
 * Rankings that are NOT listed here (QS universities, gasoline, happiness, tallest buildings) are maintained
 * by hand directly in data/rankings/<id>.json and are only checked by `npm run data:validate`.
 */
export const PIPELINES: Pipeline[] = [
  {
    meta: {
      id: "gdp-nominal", title: "Largest Economies by GDP (Nominal)", category: "economy", icon: "💰",
      desc: "Total value of goods and services produced in a year, in current US dollars.",
      unit: "USD billion", prefix: "$", suffix: "B", decimals: 1, order: "desc",
    },
    fetch: worldBank({ indicator: "NY.GDP.MKTP.CD", scale: 1e-9 }),
  },
  {
    meta: {
      id: "population", title: "Most Populous Countries", category: "society", icon: "👥",
      desc: "Total number of people living in each country, in millions.",
      unit: "million people", prefix: "", suffix: "M", decimals: 1, order: "desc",
    },
    fetch: worldBank({ indicator: "SP.POP.TOTL", scale: 1e-6 }),
  },
  {
    meta: {
      id: "life-expectancy", title: "Life Expectancy at Birth", category: "health", icon: "❤️",
      desc: "Average number of years a newborn is expected to live.",
      unit: "years", prefix: "", suffix: " yrs", decimals: 1, order: "desc",
    },
    fetch: worldBank({ indicator: "SP.DYN.LE00.IN" }),
  },
  {
    meta: {
      id: "big-mac", title: "Big Mac Prices Around the World", category: "prices", icon: "🍔",
      desc: "The Economist's Big Mac Index: a burger-sized look at purchasing power. Local price converted to USD.",
      unit: "USD", prefix: "$", suffix: "", decimals: 2, order: "desc",
    },
    fetch: bigMac,
  },
  {
    meta: {
      id: "internet-speed-fixed", title: "Fastest Fixed Broadband Internet", category: "tech", icon: "🚀",
      desc: "Median download speed of home broadband connections, measured by Ookla Speedtest.",
      unit: "Mbps (median download)", prefix: "", suffix: " Mbps", decimals: 1, order: "desc",
    },
    fetch: wikipediaSpeed("Fixed broadband"),
  },
  {
    meta: {
      id: "internet-speed-mobile", title: "Fastest Mobile Internet", category: "tech", icon: "📱",
      desc: "Median download speed on mobile networks, measured by Ookla Speedtest.",
      unit: "Mbps (median download)", prefix: "", suffix: " Mbps", decimals: 1, order: "desc",
    },
    fetch: wikipediaSpeed("Mobile connection"),
  },
];
