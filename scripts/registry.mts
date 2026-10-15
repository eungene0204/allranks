import { bigMac } from "./sources/bigmac.mts";
import { owid } from "./sources/owid.mts";
import { gasoline } from "./sources/globalpetrolprices.mts";
import { equilarCeoPay } from "./sources/equilar.mts";
import { wikipediaSpeed } from "./sources/wikipedia-speed.mts";
import {
  usAirports, usCities, usCollegeEndowment, usCompanies, usGdp, usGunDeathRate, usGunOwnership, usHomicideRate,
  usHouseholdIncome, usLifeExpectancy, usNationalParks, usPopulationDensity, usPoverty, usPublicEnrollment,
  usStateArea, usStatePopulation, usTallestBuildings, usUnemployment,
} from "./sources/wikipedia-us.mts";
import { scorecard } from "./sources/college-scorecard.mts";
import { worldBank } from "./sources/worldbank.mts";
import { billionaires, coffee, largestCities, millionaires, nobelLaureates, oilReserves, topWebsites, wine } from "./sources/wikipedia-world.mts";
import { REGIONAL } from "./regional/index.mts";
import { TOPICS } from "./topics.mts";
import type { Pipeline } from "./lib/types.mts";

/**
 * Rankings whose numbers are fetched automatically. To add one: write (or reuse) a source adapter that
 * returns `Fetched`, then register it here with its metadata.
 *
 * Rankings that are NOT listed here (QS universities, tallest buildings) are maintained
 * by hand directly in data/rankings/<id>.json and are only checked by `npm run data:validate`.
 */
export const PIPELINES: Pipeline[] = [
  {
    meta: {
      id: "us-highest-paid-ceos", title: "Highest-Paid CEOs in the US", short: "CEO Pay", category: "economy", icon: "💼",
      desc: "The 100 highest-paid CEOs in the Equilar / New York Times 2026 study, ranked by fiscal 2025 total awarded compensation. Includes stock and options valued at grant date, rather than realized take-home pay. Company and ticker are shown below each CEO.",
      unit: "USD", prefix: "$", suffix: "", decimals: 0, order: "desc", scope: "US",
    },
    fetch: equilarCeoPay,
    minItems: 100,
  },
  {
    meta: {
      id: "gasoline", title: "Gasoline Prices by Country", category: "economy", icon: "⛽",
      desc: "Average pump price for one liter of gasoline, in US dollars. Highest first.",
      unit: "USD per liter", prefix: "$", suffix: "", decimals: 2, order: "desc",
    },
    fetch: gasoline,
  },
  {
    meta: {
      id: "happiness", title: "World Happiness Ranking", category: "society", icon: "😊",
      desc: "Average life evaluation on a 0–10 scale from national surveys.",
      unit: "score (0–10)", prefix: "", suffix: "", decimals: 2, order: "desc",
    },
    fetch: owid({ slug: "happiness-cantril-ladder", name: "World Happiness Report / Gallup World Poll, via Our World in Data", minCountries: 100, note: "Cantril ladder, yearly average; the report's headline ranking uses three-year averages, so close scores can swap places." }),
  },
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
      id: "life-expectancy", title: "Life Expectancy at Birth", category: "society", icon: "❤️",
      desc: "Average number of years a newborn is expected to live.",
      unit: "years", prefix: "", suffix: " yrs", decimals: 1, order: "desc",
    },
    fetch: worldBank({ indicator: "SP.DYN.LE00.IN" }),
  },
  {
    meta: {
      id: "big-mac", title: "Big Mac Prices Around the World", category: "economy", icon: "🍔",
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
  // More World Bank indicators — topics popular with data-journalism rankings (wealth, tax, tourism, climate…).
  ...worldBankRankings(),
  // Wealth, prizes, websites and commodities from Wikipedia's tables.
  {
    meta: { id: "billionaires", title: "Countries With the Most Billionaires", category: "economy", icon: "🤑", desc: "Number of billionaires living in each country, per the Forbes list.", unit: "billionaires", prefix: "", suffix: "", decimals: 0, order: "desc" },
    fetch: billionaires(),
  },
  {
    meta: { id: "millionaires", title: "Countries With the Most Millionaires", category: "economy", icon: "💎", desc: "Number of people worth over US$1 million, in millions of people.", unit: "million people", prefix: "", suffix: "M", decimals: 2, order: "desc" },
    fetch: millionaires(),
  },
  {
    meta: { id: "nobel-laureates", title: "Most Nobel Laureates", category: "education", icon: "🏅", desc: "Nobel laureates by country (at the time of the award), all prizes since 1901.", unit: "laureates", prefix: "", suffix: "", decimals: 0, order: "desc" },
    fetch: nobelLaureates(),
  },
  {
    meta: { id: "largest-cities", title: "Largest Cities in the World", category: "society", icon: "🌆", desc: "The 50 biggest urban areas by population.", unit: "people", prefix: "", suffix: "", decimals: 0, order: "desc", multi: true },
    fetch: largestCities(),
  },
  {
    meta: { id: "top-websites", title: "Most Visited Websites", category: "tech", icon: "🖥️", desc: "The most visited websites in the world, ranked by Similarweb traffic. Shown with the country of the owner.", unit: "Rank", prefix: "#", suffix: "", decimals: 0, order: "asc", multi: true },
    fetch: topWebsites(),
  },
  {
    meta: { id: "oil-reserves", title: "Largest Proven Oil Reserves", category: "world", icon: "🛢️", desc: "Proven crude oil reserves in billions of barrels.", unit: "billion barrels", prefix: "", suffix: "B", decimals: 1, order: "desc" },
    fetch: oilReserves(),
  },
  {
    meta: { id: "coffee-production", title: "Top Coffee Producers", category: "world", icon: "☕", desc: "Green coffee production in thousands of tonnes.", unit: "thousand tonnes", prefix: "", suffix: "k t", decimals: 0, order: "desc" },
    fetch: coffee(),
  },
  {
    meta: { id: "wine-production", title: "Top Wine Producers", category: "world", icon: "🍷", desc: "Wine production in thousands of tonnes.", unit: "thousand tonnes", prefix: "", suffix: "k t", decimals: 0, order: "desc" },
    fetch: wine(),
  },
  // Topics for the categories that started out empty (AI, Markets, Energy, Money, Demographics, Mining, Autos).
  ...TOPICS,
  // Rankings that exist only inside one country. `scope` ties them to that country's page (reached from the
  // globe) instead of the world totals; items carry that country's code and name the state / city / school.
  ...usRankings(),
  // The same for other countries: one module per country in scripts/regional/.
  ...REGIONAL,
];

function usRankings(): Pipeline[] {
  const SHORT: Record<string, string> = {
    "us-college-endowment": "Endowment", "us-most-selective": "Most selective", "us-graduation-rate": "Graduation rate", "us-graduate-earnings": "Graduate earnings", "us-highest-sat": "SAT scores", "us-public-enrollment": "Enrollment", "us-unemployment": "Unemployment",
    "us-household-income": "Household income", "us-poverty": "Poverty", "us-gdp": "GDP", "us-gdp-per-capita": "GDP per capita",
    "us-largest-companies": "Companies", "us-state-population": "Population", "us-population-density": "Density",
    "us-city-population": "Cities", "us-gun-ownership": "Gun ownership", "us-gun-homicide-rate": "Gun homicides",
    "us-gun-suicide-rate": "Gun suicides", "us-homicide-rate": "Homicides", "us-life-expectancy": "Life expectancy",
    "us-tallest-buildings": "Skyscrapers", "us-busiest-airports": "Airports", "us-national-parks": "National parks", "us-state-area": "Area",
  };
  // The universities lead the US page, most-asked-about first.
  const SORT: Record<string, number> = { "us-most-selective": 1, "us-graduation-rate": 2, "us-graduate-earnings": 3, "us-highest-sat": 4, "us-college-endowment": 5, "us-public-enrollment": 6 };
  const us = (
    id: string, title: string, category: string, icon: string, desc: string,
    unit: string, prefix: string, suffix: string, decimals: number, fetch: Pipeline["fetch"], order: "asc" | "desc" = "desc",
  ): Pipeline => ({ meta: { id, title, short: SHORT[id], sort: SORT[id], category, icon, desc, unit, prefix, suffix, decimals, order, scope: "US" }, fetch });
  return [
    // Education
    us("us-college-endowment", "US Colleges by Endowment", "education", "🏛️", "The richest colleges and universities in the United States, by the size of their endowment.", "USD billion", "$", "B", 2, usCollegeEndowment),
    us("us-public-enrollment", "Largest US Public Universities", "education", "🎓", "The ten public university campuses with the most students.", "students", "", "", 0, usPublicEnrollment),
    us("us-most-selective", "Most Selective US Colleges", "education", "🎯", "Four-year colleges that admit the smallest share of applicants.", "% admitted", "", "%", 1, scorecard({ metric: "ADM_RATE", scale: 100, order: "asc", what: "Admission rate of the most recent entering class." }), "asc"),
    us("us-graduation-rate", "US Colleges by Graduation Rate", "education", "🧑‍🎓", "Share of first-time, full-time students who finish a bachelor's degree within six years.", "% graduating in 6 years", "", "%", 1, scorecard({ metric: "C150_4_POOLED", scale: 100, order: "desc", what: "Completion within 150% of normal time, pooled over several entering classes to avoid one-year flukes." })),
    us("us-graduate-earnings", "US Colleges by Graduate Earnings", "education", "💼", "Median yearly earnings of former students working 10 years after they first enrolled.", "USD per year", "$", "", 0, scorecard({ metric: "MD_EARN_WNE_P10", order: "desc", what: "Earnings of students who received federal financial aid and are working, not enrolled." })),
    us("us-highest-sat", "US Colleges by Average SAT", "education", "📝", "Average SAT score (math + reading/writing) of admitted students, for schools that report it.", "SAT points", "", "", 0, scorecard({ metric: "SAT_AVG", order: "desc", what: "Mid-range SAT average of the entering class." })),
    // Economy
    us("us-unemployment", "US States by Unemployment Rate", "economy", "📉", "Seasonally adjusted unemployment rate in each state and Washington, D.C. Highest rate first.", "% of labor force", "", "%", 1, usUnemployment),
    us("us-household-income", "US States by Median Household Income", "economy", "💵", "Median annual household income in each state and Washington, D.C., in inflation-adjusted dollars.", "USD per household per year", "$", "", 0, usHouseholdIncome),
    us("us-poverty", "US States by Poverty Rate", "economy", "🏚️", "Share of residents living below the federal poverty line.", "% of residents", "", "%", 1, usPoverty),
    us("us-gdp", "US States by GDP", "economy", "💰", "Total value of goods and services produced in each state, in current US dollars.", "USD billion", "$", "B", 0, usGdp("total")),
    us("us-gdp-per-capita", "US States by GDP per Capita", "economy", "💹", "Economic output per resident in each state, in current US dollars.", "USD per person", "$", "", 0, usGdp("per-capita")),
    us("us-largest-companies", "Largest US Companies by Revenue", "economy", "🏢", "The 100 biggest companies headquartered in the United States, ranked by annual revenue.", "USD billion", "$", "B", 1, usCompanies),
    // Society
    us("us-state-population", "US States by Population", "society", "👥", "Estimated resident population of each state and Washington, D.C.", "million people", "", "M", 2, usStatePopulation),
    us("us-population-density", "US States by Population Density", "society", "🏙️", "People per square mile of land area.", "people per sq mi", "", "", 0, usPopulationDensity),
    us("us-city-population", "Largest US Cities by Population", "society", "🌆", "The 100 most populous incorporated cities in the United States.", "people", "", "", 0, usCities),
    us("us-gun-ownership", "US States by Household Gun Ownership", "society", "🔫", "Estimated share of households with a firearm in each state (RAND, 2016).", "% of households", "", "%", 0, usGunOwnership),
    us("us-gun-homicide-rate", "US States by Gun Homicide Rate", "society", "🚨", "Firearm homicides per 100,000 residents.", "per 100,000 people", "", "", 1, usGunDeathRate("homicide")),
    us("us-gun-suicide-rate", "US States by Gun Suicide Rate", "society", "🕊️", "Firearm suicides per 100,000 residents.", "per 100,000 people", "", "", 1, usGunDeathRate("suicide")),
    us("us-homicide-rate", "US States by Homicide Rate", "society", "⚖️", "Intentional homicides per 100,000 residents, as reported to the FBI.", "per 100,000 people", "", "", 1, usHomicideRate),
    // Health
    us("us-life-expectancy", "US States by Life Expectancy", "society", "❤️", "Average number of years a newborn is expected to live in each state.", "years", "", " yrs", 1, usLifeExpectancy),
    // World records
    us("us-tallest-buildings", "Tallest Buildings in the US", "world", "🏙️", "The tallest completed buildings in the United States, by architectural height.", "metres", "", " m", 0, usTallestBuildings),
    us("us-busiest-airports", "Busiest US Airports", "world", "✈️", "Large and medium hub airports ranked by passengers per year.", "million passengers", "", "M", 1, usAirports),
    us("us-national-parks", "Most Visited US National Parks", "world", "🏞️", "National parks ranked by recreation visits in the latest full year.", "million visits", "", "M", 2, usNationalParks),
    us("us-state-area", "US States by Area", "world", "🗺️", "Total area of each state, land and water, in square miles.", "sq mi", "", "", 0, usStateArea),
  ];
}

function worldBankRankings(): Pipeline[] {
  const wb = (
    id: string, title: string, category: string, icon: string, desc: string, unit: string, prefix: string, suffix: string,
    decimals: number, indicator: string, opts: { scale?: number; minCountries?: number; order?: "asc" | "desc" } = {},
  ): Pipeline => ({
    meta: { id, title, category, icon, desc, unit, prefix, suffix, decimals, order: opts.order ?? "desc" },
    fetch: worldBank({ indicator, scale: opts.scale, minCountries: opts.minCountries }),
  });
  return [
    wb("gdp-per-capita", "Richest Countries by GDP per Capita", "economy", "💎", "Economic output per person in current US dollars.", "USD per person", "$", "", 0, "NY.GDP.PCAP.CD"),
    wb("gdp-per-capita-ppp", "GDP per Capita (Purchasing Power)", "economy", "🛒", "Output per person adjusted for what a dollar buys locally (international dollars).", "intl. USD per person", "$", "", 0, "NY.GDP.PCAP.PP.CD"),
    wb("tax-revenue", "Most Taxed Countries", "economy", "🧾", "Government tax revenue as a share of GDP.", "% of GDP", "", "%", 1, "GC.TAX.TOTL.GD.ZS", { minCountries: 80 }),
    wb("inflation", "Highest Inflation", "economy", "📈", "Yearly change in consumer prices.", "% per year", "", "%", 1, "FP.CPI.TOTL.ZG", { minCountries: 120 }),
    wb("unemployment", "Highest Unemployment", "economy", "📉", "Share of the labour force without work (ILO estimate).", "% of labour force", "", "%", 1, "SL.UEM.TOTL.ZS", { minCountries: 120 }),
    wb("health-spending", "Health Spending", "society", "🏥", "Total health expenditure as a share of GDP.", "% of GDP", "", "%", 1, "SH.XPD.CHEX.GD.ZS"),
    wb("fertility-rate", "Highest Fertility Rates", "society", "👶", "Average number of children per woman.", "births per woman", "", "", 2, "SP.DYN.TFRT.IN"),
    wb("urban-population", "Most Urbanised Countries", "society", "🏙️", "Share of the population living in cities.", "% urban", "", "%", 1, "SP.URB.TOTL.IN.ZS"),
    wb("older-population", "Oldest Populations", "society", "👴", "Share of the population aged 65 and over.", "% aged 65+", "", "%", 1, "SP.POP.65UP.TO.ZS"),
    wb("homicide-rate", "Highest Homicide Rates", "society", "⚖️", "Intentional homicides per 100,000 people.", "per 100,000 people", "", "", 1, "VC.IHR.PSRC.P5", { minCountries: 100 }),
    wb("internet-users", "Most Connected Countries", "tech", "🌐", "Share of people who use the internet.", "% of population", "", "%", 1, "IT.NET.USER.ZS"),
    wb("rd-spending", "Biggest R&D Spenders", "tech", "🔬", "Research and development spending as a share of GDP.", "% of GDP", "", "%", 2, "GB.XPD.RSDV.GD.ZS", { minCountries: 70 }),
    wb("military-spending", "Military Spending", "world", "🎖️", "Military expenditure as a share of GDP.", "% of GDP", "", "%", 1, "MS.MIL.XPND.GD.ZS", { minCountries: 120 }),
    wb("land-area", "Largest Countries by Land Area", "world", "🗺️", "Land area in square kilometres, excluding inland water.", "km²", "", "", 0, "AG.LND.TOTL.K2"),
    wb("forest-area", "Most Forested Countries", "world", "🌲", "Forest as a share of land area.", "% of land", "", "%", 1, "AG.LND.FRST.ZS"),
    wb("renewable-energy", "Renewable Energy Share", "world", "🌱", "Renewables as a share of final energy consumption.", "% of energy", "", "%", 1, "EG.FEC.RNEW.ZS", { minCountries: 120 }),
    wb("co2-per-capita", "CO₂ Emissions per Person", "world", "🏭", "Carbon dioxide emitted per person per year.", "tonnes per person", "", " t", 1, "EN.GHG.CO2.PC.CE.AR5", { minCountries: 120 }),
    wb("income-inequality", "Most Unequal Countries (Gini)", "society", "⚖️", "Gini index of income inequality: 0 is perfect equality, 100 is perfect inequality.", "Gini index", "", "", 1, "SI.POV.GINI", { minCountries: 40 }),
  ];
}
