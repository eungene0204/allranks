export type Category = { id: string; name: string; icon: string; blurb: string };

export const CATEGORIES: Category[] = [
  { id: "economy", name: "Economy", icon: "💰", blurb: "GDP, income, trade" },
  { id: "education", name: "Education", icon: "🎓", blurb: "Universities & schools" },
  { id: "prices", name: "Prices & Costs", icon: "🍔", blurb: "Fuel, food, living costs" },
  { id: "tech", name: "Technology", icon: "📡", blurb: "Internet speed, connectivity" },
  { id: "society", name: "Society", icon: "🌍", blurb: "Population & happiness" },
  { id: "health", name: "Health", icon: "❤️", blurb: "Life expectancy & care" },
  { id: "world", name: "World Records", icon: "🏙️", blurb: "Tallest, biggest, longest" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
