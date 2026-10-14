// Rankings for the categories that started out empty: AI, Markets, Energy, Money, Demographics, Mining, Autos.
// Same rule as everywhere: numbers come from an open source through an adapter, never typed by hand.
import { epochByCountry, epochLargestClusters } from "./sources/epoch.mts";
import { owid } from "./sources/owid.mts";
import { worldBank } from "./sources/worldbank.mts";
import { captionYear, headerYear, largestCompanies, modeYear, monthOfHeader, wikiCountries } from "./sources/wikipedia-topics.mts";
import type { Pipeline } from "./lib/types.mts";

const MINERALS = "List of countries by mineral production";
const USGS = "USGS Mineral Commodity Summaries";

type WbOpts = { scale?: number; minCountries?: number; order?: "asc" | "desc" };
/** World Bank indicator ranking: id, title, category, icon, desc, unit, prefix, suffix, decimals, indicator, options. */
const wb = (
  id: string, title: string, category: string, icon: string, desc: string, unit: string, prefix: string, suffix: string,
  decimals: number, indicator: string, o: WbOpts = {},
): Pipeline => ({
  meta: { id, title, category, icon, desc, unit, prefix, suffix, decimals, order: o.order ?? "desc" },
  fetch: worldBank({ indicator, scale: o.scale, minCountries: o.minCountries }),
});

type Meta = Pipeline["meta"];
const meta = (id: string, title: string, category: string, icon: string, desc: string, unit: string, prefix: string, suffix: string, decimals: number, extra: Partial<Meta> = {}): Meta =>
  ({ id, title, category, icon, desc, unit, prefix, suffix, decimals, order: "desc", ...extra });

export const TOPICS: Pipeline[] = [
  // ── AI ─────────────────────────────────────────────────────────────────────
  {
    meta: meta("ai-large-scale-models", "Countries Building the Most Large-Scale AI Models", "ai", "🤖", "Cumulative number of large-scale AI systems (trained with more than 10²³ FLOP) since 2019, by the country of the developers' main affiliation.", "AI models", "", "", 0),
    fetch: owid({ slug: "cumulative-number-of-large-scale-ai-systems-by-country", name: "Epoch AI, via Our World in Data", minCountries: 15, note: "A model with authors in several countries counts for each. Secretive models may be missing." }),
    minItems: 15,
  },
  {
    meta: meta("ai-private-investment", "Private Investment in AI by Country", "ai", "💸", "Private-market investment (venture capital and similar) in AI companies in one year, in inflation-adjusted US dollars. Listed companies such as Big Tech are not counted.", "USD billion (constant 2021 prices)", "$", "B", 1),
    fetch: owid({ slug: "private-investment-in-artificial-intelligence-cset", name: "CSET Country Activity Tracker, via Our World in Data", scale: 1e-9, minCountries: 40, note: "Private investment only; annual totals are sensitive to a few very large deals." }),
  },

  // AI infrastructure: Epoch AI's census of AI supercomputers (the closest open data to "AI data centers").
  {
    meta: meta("ai-supercomputers", "Countries with the Most AI Supercomputers", "ai", "🖥️", "Number of operational AI supercomputers (GPU/TPU clusters used for training and running AI models) that Epoch AI has identified in each country.", "AI clusters", "", "", 0),
    fetch: epochByCountry("count", "A census built from public sources, so a lower bound; clusters of private firms and of China are the hardest to see. Clusters spread over several countries are not counted."),
    minItems: 15,
  },
  {
    meta: meta("ai-compute-capacity", "Most AI Computing Power", "ai", "⚙️", "Combined computing power of each country's known AI supercomputers, in NVIDIA H100-equivalent chips.", "H100-equivalent chips", "", "", 0),
    fetch: epochByCountry("h100e", "A census built from public sources, so a lower bound. One H100-equivalent is the performance of an NVIDIA H100 GPU; other chips are converted."),
    minItems: 15,
  },
  {
    meta: meta("ai-cluster-power", "Most Power Used by AI Supercomputers", "ai", "🔌", "Combined electrical power capacity of each country's known AI supercomputers, in megawatts.", "megawatts", "", " MW", 0),
    fetch: epochByCountry("power", "A census built from public sources, so a lower bound. Power is reported or estimated for most, but not all, clusters."),
    minItems: 15,
  },
  {
    meta: meta("ai-largest-clusters", "Largest AI Supercomputers", "ai", "🧠", "The biggest operational AI supercomputers, measured in NVIDIA H100-equivalent chips, with their owners.", "H100-equivalent chips", "", "", 0, { multi: true }),
    fetch: epochLargestClusters(25),
    minItems: 20,
  },
  {
    meta: meta("top500-systems", "Most TOP500 Supercomputers", "ai", "🏆", "Number of systems each country has on the TOP500 list of the world's fastest supercomputers.", "systems on TOP500", "", "", 0),
    fetch: wikiCountries({ title: "TOP500", find: ["Distribution of supercomputers in the TOP500 list by country"], valueCol: 1, year: captionYear, asOf: (t) => monthOfHeader({ ...t, rows: [[t.caption]] }, 0)?.asOf, publisher: "TOP500.org", label: "TOP500", note: "Twice a year (June and November). The European Union total in the source table is left out; its member countries are listed separately." }),
    minItems: 15,
  },
  {
    meta: meta("semiconductor-exports", "Largest Semiconductor Exporters", "ai", "🔬", "Value of exported semiconductor devices and integrated circuits (the chips behind AI), in current US dollars.", "USD billion", "$", "B", 1),
    fetch: wikiCountries({ title: "List of countries by semiconductor exports", find: ["List of countries by semiconductor exports"], valueCol: 1, scale: 1e-6, year: captionYear, minCells: 5, publisher: "UN Comtrade (HS 8541 and 8542), compiled by Wikipedia", label: "semiconductor exports" }),
  },
  {
    meta: meta("ai-publications", "Most AI Research Papers", "ai", "📚", "Scholarly publications on artificial intelligence (journal articles, conference papers, preprints) per year, by the country of the authors' institutions.", "AI papers", "", "", 0),
    fetch: owid({ slug: "annual-scholarly-publications-on-artificial-intelligence", name: "OECD.AI, via Our World in Data", minCountries: 100, note: "A paper with authors in several countries counts for each." }),
  },
  {
    meta: meta("ai-publications-per-capita", "Most AI Research Papers per Person", "ai", "🎓", "AI research papers per million inhabitants. Small, research-heavy countries lead.", "AI papers per million people", "", "", 0),
    fetch: owid({ slug: "scholarly-publications-on-artificial-intelligence-per-million-people", name: "OECD.AI, via Our World in Data", minCountries: 100, exclude: ["VA"], note: "Vatican City is left out: a handful of papers over fewer than a thousand residents is not a meaningful rate." }),
  },
  {
    meta: meta("ai-job-postings", "Highest Demand for AI Skills", "ai", "💼", "Share of all online job postings that ask for artificial intelligence skills.", "% of job postings", "", "%", 2),
    fetch: owid({ slug: "share-artificial-intelligence-job-postings", name: "Stanford AI Index (Lightcast), via Our World in Data", minCountries: 15, note: "Only about twenty countries with enough online job-posting data are covered." }),
    minItems: 15,
  },
  {
    meta: meta("generative-ai-users", "Biggest Generative AI Adoption", "ai", "💬", "Estimated share of working-age adults who use generative AI tools.", "% of working-age adults", "", "%", 1),
    fetch: owid({ slug: "estimated-share-people-generative-ai", column: "ai_user_share", name: "Microsoft AI Economy Institute, via Our World in Data", minCountries: 100, note: "Estimate based on Microsoft's telemetry of its own AI products, adjusted for device and internet access; it is not a survey." }),
  },
  {
    meta: meta("robot-density", "Most Industrial Robots per Worker", "ai", "🦾", "Industrial robots in operation per 1,000 manufacturing employees.", "robots per 1,000 employees", "", "", 0),
    fetch: owid({ slug: "industrial-robots-in-operation-per-1000-employees", name: "International Federation of Robotics, via Our World in Data", minCountries: 15, note: "Covers the countries that report to the IFR. Counts robots per 1,000 employees in manufacturing." }),
    minItems: 15,
  },
  wb("researchers-per-million", "Most Researchers per Million People", "ai", "🧑‍🔬", "Full-time-equivalent researchers in research and development per million inhabitants — the talent pool behind AI.", "researchers per million people", "", "", 0, "SP.POP.SCIE.RD.P6", { minCountries: 60 }),
  wb("high-tech-exports", "Largest High-Tech Exporters", "ai", "🛰️", "Exports of products with high research-and-development intensity (computers, electronics, aerospace, pharmaceuticals), in current US dollars.", "USD billion", "$", "B", 0, "TX.VAL.TECH.CD", { scale: 1e-9, minCountries: 100 }),
  wb("ict-services-exports", "Largest IT and Software Services Exporters", "ai", "💻", "Exports of computer, information and telecommunications services, in current US dollars.", "USD billion", "$", "B", 1, "BX.GSR.CCIS.CD", { scale: 1e-9, minCountries: 100 }),
  // ── Markets ────────────────────────────────────────────────────────────────
  wb("stock-market-cap", "Largest Stock Markets", "economy", "📈", "Combined market value of the companies listed on each country's stock exchanges, in current US dollars.", "USD trillion", "$", "T", 1, "CM.MKT.LCAP.CD", { scale: 1e-12, minCountries: 40 }),
  wb("stock-market-cap-gdp", "Stock Market Size Relative to GDP", "economy", "⚖️", "Market value of listed domestic companies as a share of the country's GDP.", "% of GDP", "", "%", 0, "CM.MKT.LCAP.GD.ZS", { minCountries: 40 }),
  wb("listed-companies", "Most Listed Companies", "economy", "🏷️", "Number of domestic companies listed on a country's stock exchanges.", "listed companies", "", "", 0, "CM.MKT.LDOM.NO", { minCountries: 40 }),
  {
    meta: meta("largest-companies", "Largest Companies in the World by Revenue", "economy", "🏢", "The 50 biggest companies by annual revenue, shown with the country of their headquarters.", "USD billion", "$", "B", 0, { multi: true }),
    fetch: largestCompanies(),
  },

  // ── Energy ─────────────────────────────────────────────────────────────────
  {
    meta: meta("electricity-production", "Largest Electricity Producers", "energy", "⚡", "Total electricity generated per year from all sources.", "TWh per year", "", " TWh", 0),
    fetch: wikiCountries({ title: "List of countries by electricity production", find: ["Total (TWh)", "Fossil"], valueCol: 1, year: modeYear(-1), publisher: "Ember, electricity generation", label: "electricity", note: "Latest year available for each country (mostly 2024)." }),
  },
  wb("electricity-per-capita", "Electricity Use per Person", "energy", "🔌", "Electric power consumption per person per year.", "kWh per person", "", " kWh", 0, "EG.USE.ELEC.KH.PC", { minCountries: 120 }),
  wb("energy-use-per-capita", "Energy Use per Person", "energy", "🔥", "Primary energy use per person (all fuels), in kilograms of oil equivalent.", "kg of oil equivalent per person", "", " kg", 0, "EG.USE.PCAP.KG.OE", { minCountries: 120 }),
  wb("renewable-electricity", "Greenest Electricity Grids", "energy", "🍃", "Renewables (hydro, wind, solar, biomass…) as a share of electricity generated.", "% of electricity", "", "%", 1, "EG.ELC.RNEW.ZS", { minCountries: 120 }),
  {
    meta: meta("oil-production", "Largest Oil Producers", "energy", "🛢️", "Crude oil extracted per day, in millions of barrels.", "million barrels per day", "", "M", 1),
    fetch: (ctx) =>
      wikiCountries({
        title: "List of countries by oil production", find: ["Crude oil extracted"], valueCol: 1, scale: 1e-3,
        year: (t) => monthOfHeader(t, 1)?.year, asOf: (t) => monthOfHeader(t, 1)?.asOf, publisher: "U.S. Energy Information Administration, crude oil extraction", label: "oil",
      })(ctx),
  },
  {
    meta: meta("gas-reserves", "Largest Natural Gas Reserves", "energy", "🔥", "Proven natural gas reserves, in trillions of cubic metres.", "trillion m³", "", " tn m³", 1),
    fetch: wikiCountries({ title: "List of countries by natural gas proven reserves", find: ["Proven reserves", "U.S. EIA"], valueCol: 1, scale: 1e-3, year: 2021, publisher: "U.S. Energy Information Administration, proven natural gas reserves", label: "gas" }),
  },

  // ── Money ──────────────────────────────────────────────────────────────────
  wb("foreign-reserves", "Largest Foreign Exchange Reserves", "economy", "🏦", "Official reserves held by the central bank, including gold, in current US dollars.", "USD billion", "$", "B", 0, "FI.RES.TOTL.CD", { scale: 1e-9, minCountries: 100 }),
  wb("remittances", "Most Remittances Received", "economy", "📨", "Money sent home by workers abroad, per year, in current US dollars.", "USD billion", "$", "B", 1, "BX.TRF.PWKR.CD.DT", { scale: 1e-9, minCountries: 100 }),
  wb("remittances-gdp", "Most Dependent on Remittances", "economy", "💱", "Personal remittances received as a share of GDP.", "% of GDP", "", "%", 1, "BX.TRF.PWKR.DT.GD.ZS", { minCountries: 100 }),
  wb("fdi-inflows", "Most Foreign Direct Investment", "economy", "🌐", "Net inflows of foreign direct investment, in current US dollars. Negative when investors pulled out more than they put in.", "USD billion", "$", "B", 1, "BX.KLT.DINV.CD.WD", { scale: 1e-9 }),
  wb("private-credit", "Most Bank Credit to the Private Sector", "economy", "🏧", "Loans and credit that banks extend to businesses and households, as a share of GDP.", "% of GDP", "", "%", 0, "FS.AST.PRVT.GD.ZS", { minCountries: 100 }),
  {
    meta: meta("government-debt", "Highest Government Debt", "economy", "📉", "General government gross debt as a share of GDP.", "% of GDP", "", "%", 1),
    fetch: wikiCountries({ title: "List of countries by government debt", find: ["General Government Debt-to-GDP"], valueCol: 1, year: headerYear(1), publisher: "IMF World Economic Outlook, general government gross debt", label: "debt" }),
  },

  // ── Demographics ───────────────────────────────────────────────────────────
  wb("population-growth", "Fastest Growing Populations", "society", "📈", "Yearly change in the number of people living in the country.", "% per year", "", "%", 1, "SP.POP.GROW"),
  wb("birth-rate", "Highest Birth Rates", "society", "🍼", "Births per 1,000 people in a year.", "births per 1,000 people", "", "", 1, "SP.DYN.CBRT.IN"),
  wb("death-rate", "Highest Death Rates", "society", "🪦", "Deaths per 1,000 people in a year. Old populations score high even when health is good.", "deaths per 1,000 people", "", "", 1, "SP.DYN.CDRT.IN"),
  wb("immigrant-share", "Highest Share of Immigrants", "society", "🧳", "People living in a country other than the one they were born in, as a share of the population.", "% of population", "", "%", 1, "SM.POP.TOTL.ZS"),
  wb("net-migration", "Largest Net Migration", "society", "🚶", "Five-year estimate of people who moved in minus people who moved out. Negative means more people left.", "people (net)", "", "", 0, "SM.POP.NETM"),
  wb("youth-share", "Youngest Populations", "society", "🧒", "Share of the population younger than 15.", "% aged 0–14", "", "%", 1, "SP.POP.0014.TO.ZS"),
  {
    meta: meta("median-age", "Oldest Median Age", "society", "🎂", "The age that splits the population in half: half of all people are younger, half older.", "years", "", " yrs", 1),
    fetch: wikiCountries({ title: "List of countries by median age", find: ["Median age per CIA World Factbook"], valueCol: 2, year: captionYear, publisher: "CIA World Factbook, median age", label: "median age" }),
  },

  // ── Mining ─────────────────────────────────────────────────────────────────
  {
    meta: meta("copper-production", "Top Copper Producers", "energy", "🟠", "Copper mined per year (metal content), in thousands of tonnes.", "thousand tonnes", "", "k t", 0),
    fetch: wikiCountries({ title: MINERALS, find: ["copper production"], valueCol: 2, minCells: 6, scale: 1e-3, year: captionYear, publisher: USGS + ", copper", label: "copper", note: "Mine production (metal content)." }),
    minItems: 15,
  },
  {
    meta: meta("iron-ore-production", "Top Iron Ore Producers", "energy", "⛓️", "Usable iron ore produced per year, in millions of tonnes.", "million tonnes", "", " Mt", 0),
    fetch: wikiCountries({ title: MINERALS, find: ["iron ore production"], valueCol: 1, minCells: 6, scale: 1e-3, year: captionYear, publisher: USGS + ", iron ore", label: "iron ore" }),
    minItems: 15,
  },
  {
    meta: meta("silver-production", "Top Silver Producers", "energy", "🥈", "Silver mined per year, in tonnes.", "tonnes", "", " t", 0),
    fetch: wikiCountries({ title: MINERALS, find: ["silver production"], valueCol: 1, minCells: 4, rowFilter: (r) => r[3] === "2024", year: 2024, publisher: USGS + ", silver", label: "silver", note: "Countries with 2024 figures; smaller producers reported for earlier years are left out." }),
    minItems: 12,
  },
  {
    meta: meta("lithium-production", "Top Lithium Producers", "energy", "🔋", "Lithium mined per year (lithium content), in thousands of tonnes. The metal behind electric-car batteries.", "thousand tonnes", "", "k t", 1),
    fetch: wikiCountries({ title: "List of countries by lithium production", find: ["lithium production"], valueCol: 1, scale: 1e-3, year: captionYear, publisher: USGS + ", lithium", label: "lithium" }),
    minItems: 10,
  },
  {
    meta: meta("diamond-production", "Top Diamond Producers", "energy", "💎", "Rough diamonds mined per year, in millions of carats.", "million carats", "", "M ct", 1),
    fetch: wikiCountries({ title: "List of countries by diamond production", find: ["diamond production"], valueCol: 1, scale: 1e-6, year: captionYear, publisher: "Kimberley Process, rough diamond production", label: "diamonds" }),
    minItems: 15,
  },
  {
    meta: meta("coal-production", "Top Coal Producers", "energy", "⚫", "Coal mined per year, in millions of tonnes.", "million tonnes", "", " Mt", 0),
    fetch: wikiCountries({ title: "List of countries by coal production", find: ["Coal production (million tonnes)"], valueCol: 1, year: headerYear(1), publisher: "Energy Institute Statistical Review of World Energy, coal production", label: "coal" }),
    minItems: 15,
  },
  wb("mineral-rents", "Most Mineral-Dependent Economies", "energy", "⛏️", "Value of mineral extraction beyond its costs (mineral rents) as a share of GDP.", "% of GDP", "", "%", 1, "NY.GDP.MINR.RT.ZS", { minCountries: 120 }),

  // ── Green ──────────────────────────────────────────────────────────────────
  wb("co2-emissions", "Largest CO₂ Emitters", "energy", "🏭", "Carbon dioxide emitted per year from fossil fuels and industry, in millions of tonnes.", "million tonnes CO₂", "", " Mt", 0, "EN.GHG.CO2.MT.CE.AR5", { minCountries: 120 }),
  wb("methane-emissions", "Largest Methane Emitters", "energy", "🐄", "Methane released per year (from livestock, fossil fuels and waste), in millions of tonnes of CO₂ equivalent.", "million tonnes CO₂e", "", " Mt", 0, "EN.GHG.CH4.MT.CE.AR5", { minCountries: 120 }),
  wb("air-pollution", "Most Polluted Air", "energy", "😷", "Average yearly exposure to fine particles (PM2.5) in micrograms per cubic metre. The WHO guideline is 5.", "µg/m³ PM2.5", "", " µg/m³", 1, "EN.ATM.PM25.MC.M3", { minCountries: 120 }),
  wb("protected-land", "Most Protected Land", "energy", "🦌", "Share of land area set aside as national parks, reserves and other protected areas.", "% of land", "", "%", 1, "ER.LND.PTLD.ZS"),

  // ── Autos ──────────────────────────────────────────────────────────────────
  {
    meta: meta("vehicle-production", "Top Car and Vehicle Producers", "energy", "🏭", "Cars, vans, trucks and buses built per year, in millions.", "million vehicles", "", "M", 2),
    fetch: wikiCountries({ title: "List of countries by motor vehicle production", find: ["Country", "2025", "Production"], valueCol: 1, scale: 1e-6, year: headerYear(1), publisher: "OICA, motor vehicle production statistics", label: "vehicles" }),
  },
  {
    meta: meta("vehicles-per-capita", "Most Vehicles per Person", "energy", "🚗", "Registered road motor vehicles per 1,000 inhabitants.", "vehicles per 1,000 people", "", "", 0),
    fetch: wikiCountries({ title: "List of countries by vehicles per capita", find: ["Vehicles per 1,000 people"], valueCol: 1, year: modeYear(4), publisher: "National statistics, compiled from official vehicle registrations", label: "vehicles per capita", note: "Latest year available for each country; the year differs between countries." }),
  },
  {
    meta: meta("ev-market-share", "Electric Car Market Share", "energy", "🔌", "Plug-in electric cars (battery and plug-in hybrid) as a share of new passenger cars sold.", "% of new car sales", "", "%", 1),
    fetch: wikiCountries({ title: "Electric car use by country", find: ["Passenger plug-in market share"], valueCol: 1, year: headerYear(1), publisher: "National registration data and IEA Global EV Outlook, plug-in car sales share", label: "EV share", note: "Only countries with published sales data are listed." }),
    minItems: 15,
  },
];
