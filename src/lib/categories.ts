export type Category = { id: string; name: string; icon: string; blurb: string };

export const CATEGORIES: Category[] = [
  { id: "economy", name: "Economy", icon: "💰", blurb: "GDP, income, trade" },
  { id: "education", name: "Education", icon: "🎓", blurb: "Universities & schools" },
  { id: "prices", name: "Prices & Costs", icon: "🍔", blurb: "Fuel, food, living costs" },
  { id: "tech", name: "Technology", icon: "📡", blurb: "Internet speed, connectivity" },
  { id: "society", name: "Society", icon: "🌍", blurb: "Population & happiness" },
  { id: "health", name: "Health", icon: "❤️", blurb: "Life expectancy & care" },
  { id: "world", name: "World Records", icon: "🏙️", blurb: "Tallest, biggest, longest" },
  { id: "ai", name: "AI", icon: "🤖", blurb: "AI models, adoption & investment" },
  { id: "markets", name: "Markets", icon: "📈", blurb: "Market capitalization, stock exchanges & companies" },
  { id: "energy", name: "Energy", icon: "⚡", blurb: "Energy production, reserves & electricity" },
  { id: "money", name: "Money", icon: "💵", blurb: "Wealth, banking & currencies" },
  { id: "demographics", name: "Demographics", icon: "👥", blurb: "Population growth, age & migration" },
  { id: "mining", name: "Mining", icon: "⛏️", blurb: "Mineral production, reserves & mining companies" },
  { id: "autos", name: "Autos", icon: "🚗", blurb: "Vehicle production, sales & electric vehicles" },
  { id: "green", name: "Green", icon: "🌱", blurb: "Emissions, clean energy & environmental performance" },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
