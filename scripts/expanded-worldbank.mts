import { worldBank } from "./sources/worldbank.mts";
import type { Pipeline } from "./lib/types.mts";

// Each series was checked against the World Bank WDI API for a 2025 country-level
// release. The updater still chooses the newest common year with sufficient rows.
type Format = "pct" | "usd" | "usdB" | "intl" | "million" | "count" | "days" | "years" | "score" | "sqkm" | "months" | "per100" | "tiv";
type Spec = [id: string, title: string, category: string, icon: string, desc: string, indicator: string, format: Format];

const SPECS: Spec[] = [
  ["forest-area-total", "Largest Forest Areas", "energy", "🌲", "Total forest area, including natural and planted forests.", "AG.LND.FRST.K2", "sqkm"],
  ["marine-protection", "Most Protected Territorial Waters", "energy", "🐠", "Marine protected areas as a share of territorial waters.", "ER.MRN.PTMR.ZS", "pct"],
  ["firms-monitoring-emissions", "Firms Tracking Their CO₂ Emissions", "energy", "🏭", "Share of surveyed firms that monitor their own carbon dioxide emissions.", "IC.FRM.CO2.ZS", "pct"],
  ["firms-energy-management", "Firms Cutting Emissions with Energy Management", "energy", "⚡", "Share of surveyed firms adopting energy management measures to reduce emissions.", "IC.FRM.ENGM.ZS", "pct"],

  ["bank-bad-loans", "Highest Bank Nonperforming Loan Shares", "economy", "🏦", "Nonperforming loans as a share of banks' gross loans.", "FB.AST.NPER.ZS", "pct"],
  ["bank-capital-ratio", "Highest Bank Capital Ratios", "economy", "🏦", "Bank capital as a share of bank assets.", "FB.BNK.CAPA.ZS", "pct"],
  ["bank-liquid-reserves", "Highest Bank Liquid Reserve Ratios", "economy", "💧", "Liquid reserves as a share of bank assets.", "FD.RES.LIQU.AS.ZS", "pct"],
  ["bank-private-credit", "Bank Credit to the Private Sector", "economy", "💳", "Domestic credit supplied to the private sector by banks relative to GDP.", "FD.AST.PRVT.GD.ZS", "pct"],
  ["import-reserve-cover", "Foreign Reserves in Months of Imports", "economy", "🛡️", "International reserves measured in months of goods and services imports.", "FI.RES.TOTL.MO", "months"],
  ["broad-money-gdp", "Largest Money Supplies Relative to GDP", "economy", "💵", "Broad money as a share of GDP.", "FM.LBL.BMNY.GD.ZS", "pct"],
  ["broad-money-growth", "Fastest Money Supply Growth", "economy", "📈", "Annual percentage growth in broad money.", "FM.LBL.BMNY.ZG", "pct"],
  ["stock-trading-gdp", "Most Stock Trading Relative to GDP", "economy", "📊", "Value of stocks traded during the year as a share of GDP.", "CM.MKT.TRAD.GD.ZS", "pct"],
  ["voice-accountability", "Voice and Accountability", "society", "🗳️", "World Bank governance score for citizen participation, freedom of expression and a free media; higher is better.", "GOV_WGI_VA_SC", "score"],
  ["human-capital-education", "Human Capital: Education", "education", "🎓", "World Bank Human Capital Index Plus education pillar score, both sexes.", "HD_HCIP_EDUC_TO", "score"],
  ["human-capital-health", "Human Capital: Health", "society", "❤️", "World Bank Human Capital Index Plus health pillar score, both sexes.", "HD_HCIP_HLTH_TO", "score"],

  ["business-ready-finance", "Business-Ready Financial Services", "economy", "🏦", "World Bank B-READY overall score for the financial services business environment.", "IC.BRE.FS.OS", "score"],
  ["business-ready-trade", "Business-Ready International Trade", "economy", "🚢", "World Bank B-READY overall score for international trade regulation and services.", "IC.BRE.IT.OS", "score"],
  ["business-ready-labor", "Business-Ready Labor Markets", "economy", "👷", "World Bank B-READY overall score for labor regulation and public services.", "IC.BRE.LB.OS", "score"],
  ["business-ready-tax", "Business-Ready Tax Systems", "economy", "🧾", "World Bank B-READY overall score for tax regulation and administration.", "IC.BRE.TX.OS", "score"],
  ["business-ready-utilities", "Business-Ready Utility Services", "energy", "🔌", "World Bank B-READY overall score for electricity, water and internet utility services.", "IC.BRE.US.OS", "score"],
  ["business-ready-public-services", "Business-Ready Public Services", "economy", "🏛️", "World Bank B-READY cross-topic score for public services supporting businesses.", "IC.BRE.P2.PS", "score"],
  ["customs-export-time", "Fastest Export Customs Clearance", "economy", "📦", "Average days firms report needing to clear exports through customs; fewer is faster.", "IC.CUS.DURS.EX", "days"],
  ["customs-import-time", "Fastest Import Customs Clearance", "economy", "🚚", "Average days firms report needing to clear imports through customs; fewer is faster.", "IC.CUS.DURS.IM", "days"],
  ["firms-with-bank-loans", "Firms with a Bank Loan", "economy", "🏦", "Share of surveyed firms holding a bank loan or line of credit.", "IC.FRM.BNKL.ZS", "pct"],
  ["firms-credit-constrained", "Firms Fully Credit Constrained", "economy", "🔒", "Share of surveyed firms unable to obtain needed external finance.", "IC.FRM.CRDC.FL.ZS", "pct"],
  ["firms-exporting", "Firms Exporting at Least 10% of Sales", "economy", "🌍", "Share of surveyed firms that export directly at least one tenth of sales.", "IC.FRM.EXS.ZS", "pct"],
  ["firms-filing-taxes-online", "Firms Filing Taxes Electronically", "tech", "💻", "Share of surveyed firms that file taxes electronically.", "IC.FRM.TAXE.ZS", "pct"],
  ["tax-official-bribe-expectation", "Firms Expected to Give Gifts to Tax Officials", "society", "⚖️", "Share of surveyed firms expected to give gifts during meetings with tax officials.", "IC.TAX.GIFT.ZS", "pct"],

  ["service-imports-bop", "Largest Service Importers", "economy", "🛎️", "Services imported, as recorded in the balance of payments.", "BM.GSR.NFSV.CD", "usdB"],
  ["service-exports-bop", "Largest Service Exporters", "economy", "🛎️", "Services exported, as recorded in the balance of payments.", "BX.GSR.NFSV.CD", "usdB"],
  ["fdi-outflows", "Largest Outward Foreign Investors", "economy", "🌐", "Foreign direct investment flowing out of the reporting economy.", "BM.KLT.DINV.CD.WD", "usdB"],
  ["fdi-outflows-gdp", "Outward Investment Relative to GDP", "economy", "🌐", "Foreign direct investment outflows as a share of GDP.", "BM.KLT.DINV.WD.GD.ZS", "pct"],
  ["remittances-paid", "Largest Remittance Senders", "economy", "💸", "Personal remittances sent abroad.", "BM.TRF.PWKR.CD.DT", "usdB"],
  ["ict-service-export-share", "Most Digital Service Exports", "tech", "💻", "ICT services as a share of total service exports in the balance of payments.", "BX.GSR.CCIS.ZS", "pct"],
  ["travel-service-export-share", "Most Tourism-Dependent Service Exports", "economy", "🧳", "Travel as a share of service exports in the balance of payments.", "BX.GSR.TRVL.ZS", "pct"],
  ["travel-service-import-share", "Largest Travel Shares in Service Imports", "economy", "✈️", "Travel as a share of service imports in the balance of payments.", "BM.GSR.TRVL.ZS", "pct"],
  ["transport-service-export-share", "Largest Transport Shares in Service Exports", "economy", "🚢", "Transport as a share of service exports in the balance of payments.", "BX.GSR.TRAN.ZS", "pct"],
  ["insurance-service-export-share", "Largest Finance and Insurance Export Shares", "economy", "🛡️", "Insurance and financial services as a share of service exports.", "BX.GSR.INSF.ZS", "pct"],
  ["merchandise-trade-gdp", "Most Merchandise Trade Relative to GDP", "economy", "📦", "Merchandise imports and exports combined as a share of GDP.", "TG.VAL.TOTL.GD.ZS", "pct"],
  ["agricultural-raw-export-share", "Largest Agricultural Raw Material Export Shares", "economy", "🌱", "Agricultural raw materials as a share of merchandise exports.", "TX.VAL.AGRI.ZS.UN", "pct"],
  ["food-import-share", "Largest Food Shares in Merchandise Imports", "economy", "🥫", "Food products as a share of merchandise imports.", "TM.VAL.FOOD.ZS.UN", "pct"],
  ["food-export-share", "Largest Food Shares in Merchandise Exports", "economy", "🌾", "Food products as a share of merchandise exports.", "TX.VAL.FOOD.ZS.UN", "pct"],
  ["fuel-export-share", "Largest Fuel Shares in Merchandise Exports", "energy", "🛢️", "Fuel products as a share of merchandise exports.", "TX.VAL.FUEL.ZS.UN", "pct"],
  ["manufactures-export-share", "Largest Manufactured-Goods Export Shares", "economy", "🏭", "Manufactures as a share of merchandise exports.", "TX.VAL.MANF.ZS.UN", "pct"],
  ["metals-export-share", "Largest Ore and Metal Export Shares", "energy", "⛏️", "Ores and metals as a share of merchandise exports.", "TX.VAL.MMTL.ZS.UN", "pct"],
  ["fuel-import-share", "Largest Fuel Shares in Merchandise Imports", "energy", "⛽", "Fuel products as a share of merchandise imports.", "TM.VAL.FUEL.ZS.UN", "pct"],

  ["arms-imports", "Largest Arms Importers", "world", "🛡️", "SIPRI trend-indicator value of major conventional arms imported; this is a transfer-volume measure, not a dollar price.", "MS.MIL.MPRT.KD", "tiv"],
  ["arms-exports", "Largest Arms Exporters", "world", "🛡️", "SIPRI trend-indicator value of major conventional arms exported; this is a transfer-volume measure, not a dollar price.", "MS.MIL.XPRT.KD", "tiv"],
  ["military-spending-total", "Largest Military Budgets", "world", "🎖️", "Total military expenditure in current US dollars.", "MS.MIL.XPND.CD", "usdB"],
  ["military-budget-share", "Military Share of Government Spending", "world", "🎖️", "Military expenditure as a share of general government spending.", "MS.MIL.XPND.ZS", "pct"],

  ["household-spending-per-capita-ppp", "Household Spending per Person", "economy", "🛒", "Household and nonprofit consumption per person, adjusted for purchasing power.", "NE.CON.PCAP.PP.CD", "intl"],
  ["household-spending-growth", "Fastest Household Spending Growth", "economy", "🛍️", "Annual real growth in household and nonprofit consumption.", "NE.CON.PRVT.KD.ZG", "pct"],
  ["exports-volume-growth", "Fastest Export Growth", "economy", "🚢", "Annual real growth in exports of goods and services.", "NE.EXP.GNFS.KD.ZG", "pct"],
  ["imports-volume-growth", "Fastest Import Growth", "economy", "📦", "Annual real growth in imports of goods and services.", "NE.IMP.GNFS.KD.ZG", "pct"],
  ["investment-growth", "Fastest Fixed-Investment Growth", "economy", "🏗️", "Annual real growth in gross fixed capital formation.", "NE.GDI.FTOT.KD.ZG", "pct"],
  ["agriculture-output-growth", "Fastest Agricultural Output Growth", "economy", "🌾", "Annual real growth in agriculture, forestry and fishing value added.", "NV.AGR.TOTL.KD.ZG", "pct"],
  ["industry-output-growth", "Fastest Industrial Output Growth", "economy", "🏭", "Annual real growth in industry, including construction, value added.", "NV.IND.TOTL.KD.ZG", "pct"],
  ["manufacturing-output-growth", "Fastest Manufacturing Output Growth", "economy", "⚙️", "Annual real growth in manufacturing value added.", "NV.IND.MANF.KD.ZG", "pct"],
  ["services-output-growth", "Fastest Services Output Growth", "economy", "🛎️", "Annual real growth in services value added.", "NV.SRV.TOTL.KD.ZG", "pct"],
  ["agriculture-worker-productivity", "Agricultural Output per Worker", "economy", "🚜", "Agriculture, forestry and fishing value added per worker in constant 2015 US dollars.", "NV.AGR.EMPL.KD", "usd"],
  ["industry-worker-productivity", "Industrial Output per Worker", "economy", "🏭", "Industry and construction value added per worker in constant 2015 US dollars.", "NV.IND.EMPL.KD", "usd"],
  ["services-worker-productivity", "Service Output per Worker", "economy", "🛎️", "Services value added per worker in constant 2015 US dollars.", "NV.SRV.EMPL.KD", "usd"],
  ["gdp-per-capita-growth", "Fastest GDP Growth per Person", "economy", "📈", "Annual real growth in GDP per capita.", "NY.GDP.PCAP.KD.ZG", "pct"],
  ["gni-per-capita-atlas", "Highest Income per Person (Atlas Method)", "economy", "💰", "Gross national income per person using the World Bank Atlas conversion method.", "NY.GNP.PCAP.CD", "usd"],
  ["domestic-savings-gdp", "Highest Domestic Savings Rates", "economy", "🐷", "Gross domestic savings as a share of GDP.", "NY.GDS.TOTL.ZS", "pct"],
  ["gni-growth", "Fastest National Income Growth", "economy", "📈", "Annual real growth in gross national income.", "NY.GNP.MKTP.KD.ZG", "pct"],

  ["government-education-budget-share", "Education Share of Government Spending", "education", "🎓", "Government education expenditure as a share of total government expenditure.", "SE.XPD.TOTL.GB.ZS", "pct"],
  ["compulsory-school-years", "Longest Compulsory Schooling", "education", "📚", "Number of years of compulsory education under national law.", "SE.COM.DURS", "years"],
  ["youth-employment-rate", "Highest Youth Employment Rates", "society", "🧑‍💼", "Employed people aged 15–24 as a share of that age group's population; ILO modeled estimate.", "SL.EMP.1524.SP.ZS", "pct"],
  ["self-employment-share", "Largest Self-Employed Workforces", "society", "🧑‍🔧", "Self-employed workers as a share of total employment; ILO modeled estimate.", "SL.EMP.SELF.ZS", "pct"],
  ["vulnerable-employment", "Highest Vulnerable Employment", "society", "⚠️", "Own-account and contributing family workers as a share of employment; ILO modeled estimate.", "SL.EMP.VULN.ZS", "pct"],
  ["wage-employment-share", "Largest Wage-Employment Shares", "society", "💼", "Wage and salaried workers as a share of total employment; ILO modeled estimate.", "SL.EMP.WORK.ZS", "pct"],
  ["employers-share", "Largest Employer Shares", "society", "🏢", "Employers as a share of total employment; ILO modeled estimate.", "SL.EMP.MPYR.ZS", "pct"],
  ["women-in-management", "Women in Senior and Middle Management", "society", "👩‍💼", "Female share of senior and middle management jobs.", "SL.EMP.SMGT.FE.ZS", "pct"],
  ["output-per-worker", "Highest Output per Worker", "economy", "⚙️", "GDP per employed person, adjusted for purchasing power in constant 2021 international dollars.", "SL.GDP.PCAP.EM.KD", "intl"],
  ["youth-labor-participation", "Highest Youth Labor Participation", "society", "🧑‍🏭", "Labor-force participation among people aged 15–24; ILO modeled estimate.", "SL.TLF.ACTI.1524.ZS", "pct"],
  ["female-labor-participation", "Highest Female Labor Participation", "society", "👩‍🏭", "Labor-force participation among women aged 15 and older; ILO modeled estimate.", "SL.TLF.CACT.FE.ZS", "pct"],
  ["youth-unemployment", "Highest Youth Unemployment", "society", "📉", "Unemployment among people aged 15–24; ILO modeled estimate.", "SL.UEM.1524.ZS", "pct"],
  ["female-unemployment", "Highest Female Unemployment", "society", "📉", "Unemployment among women in the labor force; ILO modeled estimate.", "SL.UEM.TOTL.FE.ZS", "pct"],
  ["neither-working-nor-studying", "Youth Outside Work and Education", "society", "🎒", "Share of young people neither in employment nor in education or training; ILO modeled estimate.", "SL.UEM.NEET.ME.ZS", "pct"],
  ["female-youth-neet", "Young Women Outside Work and Education", "society", "👩‍🎓", "Share of young women neither in employment nor in education or training; ILO modeled estimate.", "SL.UEM.NEET.FE.ME.ZS", "pct"],
  ["female-labor-force-share", "Women in the Labor Force", "society", "👩‍💼", "Women as a share of the total labor force.", "SL.TLF.TOTL.FE.ZS", "pct"],

  ["refugees-hosted", "Countries Hosting the Most Refugees", "society", "🏠", "Refugees under the UNHCR mandate by country of asylum.", "SM.POP.RHCR.EA", "count"],
  ["refugees-origin", "Largest Refugee Populations by Origin", "society", "🧳", "Refugees under the UNHCR mandate by country of origin.", "SM.POP.RHCR.EO", "count"],
  ["population-in-megacities", "Population in Million-Plus Cities", "society", "🌆", "Share of people living in urban agglomerations of more than one million residents.", "EN.URB.MCTY.TL.ZS", "pct"],
  ["largest-city-population", "Largest National Primate Cities", "society", "🏙️", "Population of each country's largest city or urban agglomeration.", "EN.URB.LCTY", "million"],
  ["population-female-share", "Highest Female Population Shares", "society", "👩", "Women and girls as a share of total population.", "SP.POP.TOTL.FE.ZS", "pct"],
  ["population-age-80-women", "Highest Shares of Women Aged 80+", "society", "👵", "Women aged 80 and over as a share of the female population.", "SP.POP.80UP.FE.5Y", "pct"],
  ["population-age-80-men", "Highest Shares of Men Aged 80+", "society", "👴", "Men aged 80 and over as a share of the male population.", "SP.POP.80UP.MA.5Y", "pct"],
  ["overall-dependency-ratio", "Highest Total Dependency Ratios", "society", "👨‍👩‍👧", "Children under 15 and adults 65+ per 100 people aged 15–64.", "SP.POP.DPND", "per100"],
  ["rural-population-growth", "Fastest-Growing Rural Populations", "society", "🌾", "Annual percentage change in rural population.", "SP.RUR.TOTL.ZG", "pct"],
  ["urban-population-growth", "Fastest-Growing Urban Populations", "society", "🏙️", "Annual percentage change in urban population.", "SP.URB.GROW", "pct"],
];

const DISPLAY: Record<Format, { unit: string; prefix: string; suffix: string; decimals: number; scale?: number }> = {
  pct: { unit: "%", prefix: "", suffix: "%", decimals: 1 },
  usd: { unit: "USD", prefix: "$", suffix: "", decimals: 0 },
  usdB: { unit: "USD billion", prefix: "$", suffix: "B", decimals: 1, scale: 1e-9 },
  intl: { unit: "international dollars", prefix: "$", suffix: "", decimals: 0 },
  million: { unit: "million people", prefix: "", suffix: "M", decimals: 1, scale: 1e-6 },
  count: { unit: "people", prefix: "", suffix: "", decimals: 0 },
  days: { unit: "days", prefix: "", suffix: " days", decimals: 1 },
  years: { unit: "years", prefix: "", suffix: " years", decimals: 0 },
  score: { unit: "score", prefix: "", suffix: "", decimals: 1 },
  sqkm: { unit: "km²", prefix: "", suffix: " km²", decimals: 0 },
  months: { unit: "months of imports", prefix: "", suffix: " months", decimals: 1 },
  per100: { unit: "dependents per 100 working-age people", prefix: "", suffix: "", decimals: 1 },
  tiv: { unit: "billion SIPRI TIV", prefix: "", suffix: "B TIV", decimals: 2, scale: 1e-9 },
};

export const EXPANDED_WORLDBANK: Pipeline[] = SPECS.map(([id, title, category, icon, desc, indicator, format]) => {
  const { unit, prefix, suffix, decimals, scale } = DISPLAY[format];
  return {
    meta: { id, title, category, icon, desc, unit, prefix, suffix, decimals,
      order: id === "customs-export-time" || id === "customs-import-time" ? "asc" : "desc" },
    fetch: worldBank({ indicator, scale }),
  };
});
