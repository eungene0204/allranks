/** Source-backed interpretation, separate from collected ranking snapshots. */
export type ReadingGuide = {
  id: string;
  title: string;
  question: string;
  answer: string;
  sections: { title: string; text: string }[];
  sources: { title: string; url: string }[];
  rankingIds: string[];
};

export const GUIDE_REVIEWED_AT = "2026-10-23";
export const READING_GUIDES: ReadingGuide[] = [
  {
    id: "economic-size-and-living-standards",
    title: "A large economy is not the same as a rich population",
    question: "Does the country with the biggest GDP also have the highest living standard?",
    answer: "Total GDP answers a question about economic scale. GDP per capita asks how much output corresponds to each resident. Use both before drawing a conclusion about prosperity.",
    sections: [
      { title: "Choose the measure for your question", text: "For market size, start with total GDP. For output relative to population, open GDP per capita. Dividing a total by population can change the ordering substantially: a large population contributes to a large total without guaranteeing a high per-person figure. Neither measure describes how income is distributed between households." },
      { title: "Why a dollar ranking can change", text: "The nominal series uses current US dollars. Price changes and conversion into dollars can affect comparisons; a change in dollar GDP should not automatically be described as a change in the volume of production. Use the separate real-growth series when asking how production changed over time." },
      { title: "What per capita still leaves out", text: "GDP per capita is output divided by population, not the salary or bank balance of a typical resident. For a living-standard question, examine local prices and distribution as well. A purchasing-power comparison addresses a different question from conversion at market exchange rates." },
      { title: "Our comparison decision", text: "AllRanks keeps total GDP, per-person GDP and real growth in separate tables rather than combining their ranks into a prosperity score. Compare the same reference year and read the coverage count first. A country missing from a table has no stored observation for that snapshot; it has not been assigned zero." },
    ],
    sources: [
      { title: "World Bank: GDP, current US dollars — indicator definition", url: "https://api.worldbank.org/v2/indicator/NY.GDP.MKTP.CD?format=json" },
      { title: "World Bank: GDP per capita — indicator definition", url: "https://api.worldbank.org/v2/indicator/NY.GDP.PCAP.CD?format=json" },
      { title: "WHO: GDP per capita and purchasing power", url: "https://www.who.int/data/nutrition/nlis/info/gross-domestic-product-(gdp)-per-capita-and-gdp-per-capita-annual-growth-rate" },
    ],
    rankingIds: ["gdp-nominal", "gdp-per-capita", "gdp-growth"],
  },
  {
    id: "reading-economic-growth",
    title: "Fast growth and a large economy answer different questions",
    question: "Does the fastest-growing economy add the most output?",
    answer: "Not necessarily. A growth rate describes a proportional change from a starting level. It does not measure the absolute size of an economy or the distribution of the gain.",
    sections: [
      { title: "Read the rate alongside the starting level", text: "As a mathematical illustration, 10% growth on a base of 100 adds 10, while 2% on a base of 1,000 adds 20. These are hypothetical values, not country observations. A higher growth percentage can therefore accompany a smaller absolute increase." },
      { title: "Why use real growth?", text: "The linked World Bank growth series measures annual change using constant-price output. That makes it a different measure from the annual change in current-dollar GDP. Do not substitute one for the other when comparing expansion over time." },
      { title: "One year cannot establish a trend", text: "A single strong year does not tell us whether growth will continue. Use the annual-history tool to inspect adjacent years and check for reversals. The table alone does not identify the cause of growth; attributing it to a policy, industry or event requires further evidence." },
      { title: "Our comparison decision", text: "AllRanks sorts the stored annual percentages without assigning a sustainability or investment score. Read nominal GDP for scale and GDP per capita for the population denominator. If the years differ, state that difference rather than presenting the three positions as a simultaneous result." },
    ],
    sources: [{ title: "World Bank: annual GDP growth — definition and methodology", url: "https://databank.worldbank.org/metadataglossary/world-development-indicators/series/NY.GDP.MKTP.KD.ZG" }],
    rankingIds: ["gdp-growth", "gdp-nominal", "gdp-per-capita"],
  },
  {
    id: "inflation-and-price-levels",
    title: "Lower inflation does not mean prices have fallen",
    question: "If inflation slows, why can the same shopping basket still cost more?",
    answer: "Inflation is a rate of price change. A smaller positive rate means prices are rising more slowly, rather than returning to an earlier level.",
    sections: [
      { title: "Separate the level from the rate", text: "Consider a hypothetical basket costing 100. After a 10% rise it costs 110; a further 2% rise takes it to 112.20. The inflation rate fell, but the basket became more expensive. This arithmetic example is not an observation about a particular country." },
      { title: "What an average basket can hide", text: "Consumer price indexes summarize price change across a basket of spending. Your own purchases can have different weights, so your experience may differ from the headline rate. The BLS explanation linked below describes the US CPI; country-specific basket and coverage details must be checked with each statistical publisher." },
      { title: "Compare matching periods", text: "An annual average and a change between two particular months are not interchangeable. Before comparing a figure from a news article with this annual table, check the period and source definition. The largest percentage is not necessarily the country with the highest absolute prices." },
      { title: "Our comparison decision", text: "AllRanks keeps the inflation rate separate from individual price comparisons. Use the table to compare reported rates, then inspect the source before interpreting household affordability. This page does not estimate any visitor’s personal cost of living." },
    ],
    sources: [{ title: "BLS: Consumer Price Index questions and answers", url: "https://www.bls.gov/cpi/questions-and-answers.htm" }],
    rankingIds: ["inflation", "big-mac", "gasoline"],
  },
  {
    id: "unemployment-and-job-markets",
    title: "Unemployment is not the share of everyone without a job",
    question: "Does a low unemployment rate prove that jobs are easy to find?",
    answer: "No. The rate uses the labour force as its denominator. It does not count every resident without paid work, and it does not describe wages or working conditions.",
    sections: [
      { title: "Check who is counted", text: "The World Bank’s modeled ILO series describes people without work who are available for and seeking employment, as a share of the labour force. It is not unemployment divided by the entire population." },
      { title: "Why the denominator matters", text: "In a hypothetical labour force of 100 people, 5 unemployed people imply a 5% rate. This example says nothing about how many other residents are outside the labour force. A separate participation measure is needed to understand that wider group." },
      { title: "What the rank cannot tell a jobseeker", text: "A national annual rate does not establish the availability of a particular occupation, the wage on offer or the suitability of work. Read it as one aggregate measure. The BLS concepts page provides a concrete explanation of participation and unemployment for the US; its survey rules should not be assumed to apply identically everywhere." },
      { title: "Our comparison decision", text: "AllRanks labels the linked series as a modeled estimate and keeps it distinct from country-specific survey releases. Use annual history for changes within a series. A difference between two published rates can reflect different periods or definitions, so check both sources before describing it as an error." },
    ],
    sources: [
      { title: "World Bank: modeled ILO unemployment definition", url: "https://api.worldbank.org/v2/indicator/SL.UEM.TOTL.ZS?format=json" },
      { title: "BLS: labour-force and unemployment concepts", url: "https://www.bls.gov/cps/definitions.htm" },
    ],
    rankingIds: ["unemployment", "gdp-growth"],
  },
  {
    id: "internet-use-and-coverage",
    title: "Internet use, speed and missing countries",
    question: "Can a short table identify the world’s most connected country?",
    answer: "It identifies the highest recorded value among the entries included. A country absent from the selected year cannot be assumed to have a lower value.",
    sections: [
      { title: "Use is different from speed", text: "The World Bank indicator counts people who used the internet in the last three months, from any location and through various devices. It is a population share. Broadband and mobile speed tables answer a different question, so their positions should not be treated as substitutes." },
      { title: "Why this snapshot can be short", text: "The AllRanks World Bank collector chooses the newest single year with at least ten matched country observations. It does not fill gaps with each country’s older value. This keeps the year consistent but may leave a much narrower comparison than a previous year would provide." },
      { title: "How to interpret a missing country", text: "Absence means the snapshot has no included value, not that internet use is zero or lower than the listed countries. Even a table with a high leading percentage may be incomplete. Check the coverage notice before using first place as a worldwide claim." },
      { title: "Our comparison decision", text: "We show the included-entry count and qualify the leading position. For wider coverage, follow the publisher’s original data; for a country’s path over time, use annual history. If you compare a broader table that mixes latest available years, state that its time basis differs from ours." },
    ],
    sources: [
      { title: "World Bank / ITU: individuals using the internet — definition", url: "https://api.worldbank.org/v2/indicator/IT.NET.USER.ZS?format=json" },
      { title: "ITU: official ICT statistics and country data", url: "https://www.itu.int/en/ITU-D/Statistics/Pages/stat/default.aspx" },
    ],
    rankingIds: ["internet-users", "internet-speed-fixed", "internet-speed-mobile"],
  },
  {
    id: "university-research-metrics",
    title: "Research impact is not a complete university rating",
    question: "Should I choose a university because it leads a citation ranking?",
    answer: "Use a research ranking to investigate research activity. It does not directly measure teaching, the fit of a course, student support or the cost of attending.",
    sections: [
      { title: "Different metrics reward different things", text: "OpenAlex distinguishes publication counts, total citations and summary indicators such as the h-index and i10-index. More citations and more publications are different observations. A position in one table should not be described as an overall university score." },
      { title: "Inspect the institution behind the name", text: "Institution records may have parent and child organizations. The publisher documents affiliation-matching limitations. Before treating an apparent change as a real improvement, check whether the underlying institution boundary or indexed records changed." },
      { title: "Make a decision that matches your goal", text: "For a research degree, start with the field and potential supervisor, then use the institutional table as context. For an undergraduate course, investigate the curriculum and teaching arrangements separately. These are AllRanks reading suggestions, not outcomes predicted by the citation data." },
      { title: "Our comparison decision", text: "AllRanks keeps each research metric separate and links the country’s related tables below. The snapshot year does not mean all counted research was published in that year: cumulative measures cover a longer body of work. Source updates can also revise counts independently of new research." },
    ],
    sources: [
      { title: "OpenAlex: common attributes and research metrics", url: "https://help.openalex.org/data/common-attributes/" },
      { title: "OpenAlex: institution boundaries and known limitations", url: "https://help.openalex.org/data/institutions/" },
    ],
    rankingIds: [],
  },
  {
    id: "airport-size-and-runways",
    title: "A long runway does not make an airport the busiest",
    question: "Can runway length tell me how important an airport is?",
    answer: "Runway length describes a physical feature. Passenger traffic, scheduled service and airport elevation are separate measures, so they should be compared for different purposes.",
    sections: [
      { title: "What the measurement describes", text: "OurAirports publishes runway lengths in feet and airport elevation in feet above mean sea level. AllRanks converts values into the units printed on each table. Length and elevation should never be interpreted as passenger counts or service quality." },
      { title: "What is included", text: "The local runway collector retains small, medium and large airports, then uses each airport’s longest runway not marked closed. Airports without a recorded usable length are absent. An omitted airport has not been assigned a length of zero." },
      { title: "Use the source for operational questions", text: "The publisher releases community-maintained data without an accuracy or fitness guarantee. This table is for exploration, not flight planning. A long recorded surface does not establish that a flight is available or that a particular aircraft can operate there." },
      { title: "Our comparison decision", text: "Within a country, compare longest runways and elevation as separate physical features. Use the country link to find related lists. The snapshot date records our collection, not a new engineering survey of each runway." },
    ],
    sources: [
      { title: "OurAirports: dataset definitions", url: "https://ourairports.com/help/data-dictionary.html" },
      { title: "OurAirports: downloads and reuse terms", url: "https://ourairports.com/data/" },
    ],
    rankingIds: [],
  },

  {
    id: "city-population-and-boundaries",
    title: "Why two city population rankings can disagree",
    question: "Why does the same city appear with different populations?",
    answer: "First check the boundary and observation date. A municipality and its surrounding urban area describe different populations, even when both are labeled with the same city name.",
    sections: [
      { title: "Start with the boundary", text: "Before comparing two figures, establish whether they describe a city proper, a built-up area or a metropolitan region. A larger number can result from a larger boundary without any population growth. The name alone does not establish that two records describe the same area." },
      { title: "A download date is not a census date", text: "GeoNames combines many sources and supplies an updated geographical database. Downloading it this year does not make every population figure a new census observation. Our local collector records a snapshot year; the stored city populations can have different underlying dates." },
      { title: "Our selection decision", text: "AllRanks’ GeoNames city collector uses the cities15000 extract, keeps positive population records and lists up to 50 places per country. The elevation view instead orders eligible places with positive recorded elevation. It describes elevation of listed settlements, not the highest geographic point in the country." },
      { title: "Use a rank for the right task", text: "Use this table to explore places and form a question for further research. For a population trend, find observations with consistent boundaries and dates from the statistical publisher. Subtracting two incompatible city figures would create a misleading growth estimate, so the comparison tool only subtracts values within the displayed snapshot." },
    ],
    sources: [
      { title: "GeoNames: data sources and limitations", url: "https://www.geonames.org/export/" },
      { title: "GeoNames: extract definitions and fields", url: "https://download.geonames.org/export/dump/readme.txt" },
    ],
    rankingIds: [],
  },
  {
    id: "reading-product-shortlists",
    title: "Choose a product for your needs, not its position in a list",
    question: "Does the first product in a source list suit every buyer?",
    answer: "A category pick can be best for one use case without beating every other pick on a common test. Start with the source’s category label and the product note, then check the original review.",
    sections: [
      { title: "Identify the kind of evidence", text: "A measured score, a reliability survey and an editor’s category pick are different kinds of evidence. For example, Good Housekeeping describes laboratory evaluation and consumer testing in its testing-method page. That description does not mean every source on AllRanks uses the same protocol or that AllRanks performed those tests." },
      { title: "Turn a recommendation into a question", text: "Use the item note to decide what to investigate next. If a product is labeled for a particular use case, ask whether that is your own priority. Check the exact model, available formulation and local availability before treating a recommendation as applicable to the product you can buy." },
      { title: "Compare costs on a consistent basis", text: "A useful buying worksheet records the current price, pack size, relevant feature and stated limitation side by side. For consumables, compare equivalent quantities; for appliances, include any required replacement items. These are suggested checks for the buyer. AllRanks does not publish current local prices or ownership-cost estimates for these lists." },
      { title: "Our presentation decision", text: "We preserve the source order and item notes, and keep category selections distinct from measured scores. We do not calculate numerical performance gaps between ordinal picks. Source checking confirms what the cited list says; it is not firsthand product experience, a safety certification or a promise that the product fits your circumstances." },
    ],
    sources: [{ title: "Good Housekeeping Institute: how its product testing works", url: "https://www.goodhousekeeping.com/about/institute/a19748212/good-housekeeping-institute-product-reviews/" }],
    rankingIds: [],
  },
];

export const getReadingGuide = (id: string) => READING_GUIDES.find((guide) => guide.id === id);

export function guideForRanking(r: { id: string; category?: string; entityType?: string; source: { url?: string } }): ReadingGuide | undefined {
  if (r.id === "gdp-growth") return getReadingGuide("reading-economic-growth");
  const direct = READING_GUIDES.find((guide) => guide.rankingIds.includes(r.id));
  if (direct) return direct;
  if (r.source.url?.includes("openalex.org")) return getReadingGuide("university-research-metrics");
  if (r.source.url?.includes("geonames.org")) return getReadingGuide("city-population-and-boundaries");
  if (r.category === "everyday" && r.entityType === "product") return getReadingGuide("reading-product-shortlists");
  if (r.source.url?.includes("ourairports.com")) return getReadingGuide("airport-size-and-runways");
}
