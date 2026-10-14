export type Category = { id: string; name: string; icon: string; blurb: string };

export const CATEGORIES: Category[] = [
  { id: "economy", name: "Economy", icon: "💰", blurb: "GDP, income, trade, markets, money & prices" },
  { id: "education", name: "Education", icon: "🎓", blurb: "Universities & schools" },
  { id: "tech", name: "Technology", icon: "📡", blurb: "Internet speed & connectivity" },
  { id: "ai", name: "AI", icon: "🤖", blurb: "AI models, adoption & investment" },
  { id: "society", name: "Society & Health", icon: "🌍", blurb: "Population, demographics, happiness & health" },
  { id: "energy", name: "Energy & Industry", icon: "⚡", blurb: "Energy, mining, vehicles & the environment" },
  { id: "world", name: "World Records", icon: "🏙️", blurb: "Tallest, biggest, longest" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
