import type { Ranking } from "./types";
import type { EditorialProfile } from "./editorial-types";

const profiles: Record<string, Omit<EditorialProfile, "id">> = {
  "research-citations": {
    question: "Which listed institutions have the largest accumulated citation record?",
    interpretation: "Total citations describe the indexed attention received by an institution’s research. They combine activity across papers and years. A high total can reflect a large body of work as well as frequently cited work; it is not a direct measurement of classroom teaching.",
    decision: "Read citation totals beside publication totals for the same institution. If the question concerns a specific research field, inspect that field’s papers and affiliations rather than transferring the institution-wide position to every department.",
    limitation: "Institution boundaries, affiliation matching and database updates affect the total. A snapshot-year label does not restrict the cited research to that publication year.",
  },
  "research-publications": {
    question: "Which listed institutions have the largest indexed research output?",
    interpretation: "A work count measures the volume of indexed scholarly output. It does not establish how much any individual paper contributed, how much research cost, or the quality of a course offered by the institution.",
    decision: "Use this measure when investigating research scale. Look at citation and recent-citedness tables separately if you want to examine the response to that output; do not average the positions into a teaching score.",
    limitation: "The count depends on which works and affiliations the index connects to an institution. Large or long-established institutions have more opportunities to accumulate works, so raw totals do not adjust for institution size or age.",
  },
  "research-h-index": {
    question: "How broad is the citation record behind an institution’s h-index?",
    interpretation: "An h-index of h means at least h indexed works each have at least h citations. The index combines a count of works with a citation threshold; doubling it does not mean teaching or research quality doubled.",
    decision: "Use the h-index as one description of an accumulated publication record. Compare institution boundaries and research areas before interpreting a gap, and consult the publication and citation tables to understand the scale behind it.",
    limitation: "This cumulative threshold rewards established bodies of work and is sensitive to index coverage. Two institutions can share an h-index while having very different numbers of papers and citations above the threshold.",
  },
  "research-i10-index": {
    question: "How many indexed works have crossed the ten-citation threshold?",
    interpretation: "The i10-index counts works with at least ten citations. It is a threshold count, so a work with ten citations and one with thousands each contribute one to this measure.",
    decision: "Read this as the breadth of work passing a particular citation threshold. Compare total works for context; a large i10-index alone does not tell you the share of all work that passed the threshold.",
    limitation: "The stored index does not describe teaching outcomes, field-adjusted impact or recent improvement. Old and new works can both contribute, and index corrections can change the result.",
  },
  "research-recent": {
    question: "How does recent citation intensity differ between the listed institutions?",
    interpretation: "Recent mean citedness is an average-style citation indicator rather than a total publication count. A higher value need not come from a larger institution. Citation timing and research-field mix affect what can be learned from the comparison.",
    decision: "Inspect the publisher’s citation and publication windows before interpreting this as a current-year result. Check output volume as well: a mean can be strongly influenced by a small set of highly cited works.",
    limitation: "This is not a probability of academic success, a teaching score or evidence that every department performs at the institutional average. The database’s snapshot year differs from the research window.",
  },
  "airport-runway": {
    question: "Which listed airports have the longest recorded runway surfaces?",
    interpretation: "Runway length is a physical dimension. Our collector takes the longest recorded runway not marked closed at each eligible airport and converts feet to metres. A long runway does not by itself establish passenger demand, airline service or suitability for a particular flight.",
    decision: "Use the table to compare airport infrastructure, then inspect the source record for surface type and location. Passenger traffic and airport elevation are different questions and need separate measures.",
    limitation: "The collector includes small, medium and large airports with a positive usable length and retains up to 50 per country. The community-maintained records are not certified operational or flight-planning information.",
  },
  "airport-elevation": {
    question: "How high above sea level are the listed airport locations?",
    interpretation: "Elevation describes height above mean sea level, rather than the length of a runway or the number of passengers. The collector converts the recorded feet value into metres.",
    decision: "Use elevation for geographical exploration. Open the related runway or traffic list to investigate a different feature, and consult authoritative operational information for any aviation decision.",
    limitation: "This collector retains positive recorded elevations, so it does not represent every airport, including those at or below sea level. The list is capped at 50 entries per country and depends on source coverage.",
  },
  "city-elevation": {
    question: "Which included settlements have the highest recorded elevations?",
    interpretation: "The value describes settlement elevation in the geographical extract. It is not the height of the highest mountain, a measure of city population or the elevation of every point within an urban boundary.",
    decision: "Use the location and population context in the item note to identify the place. To study residents or growth, consult the population table and compatible census boundaries instead of inferring population from elevation.",
    limitation: "The collector uses the cities15000 extract, keeps positive elevation records and lists up to 50 places. This is a selection of settlements, not a census of all populated places or all high-altitude communities.",
  },
  "city-population": {
    question: "Which included cities or municipalities have the largest recorded populations?",
    interpretation: "Population counts depend on the boundary being counted. A city proper, municipality, built-up area and metropolitan region may share a name while describing different groups of residents.",
    decision: "Check the source’s geographical definition and observation date before comparing this figure with another website. To estimate growth, use a time series with consistent boundaries rather than subtracting two differently defined city figures.",
    limitation: "A city’s absence is not a zero population. Geographical databases and compiled lists may combine census observations and estimates from different dates; a collection year does not make them contemporaneous.",
  },
  "regional-population": {
    question: "How is the listed population distributed across the included administrative areas?",
    interpretation: "A population total counts residents within a specified administrative boundary. More residents do not establish greater population density or faster growth, because area and the previous population are separate inputs.",
    decision: "Use counts to investigate the scale of an administrative area. For pressure on land or services, examine density and age composition separately. Check whether the source includes territories and special administrative units alongside the main regions.",
    limitation: "Boundary changes and different census or estimate dates can affect comparisons. The names and territorial coverage should be matched before treating the difference between two editions as population growth.",
  },
  "regional-gdp": {
    question: "Which included administrative areas have the largest reported economic output?",
    interpretation: "Regional GDP totals describe economic scale within the reported territory. They do not measure the income received by a typical resident. A larger population or concentration of production can contribute to a large total.",
    decision: "Compare regional GDP per person when investigating output relative to population. Check the currency, price basis and reference year first; totals and per-person figures answer different questions.",
    limitation: "Different regional accounting boundaries or currency conversions can change a comparison. A change in current-price output is not automatically real growth in production.",
  },
  "regional-gdp-person": {
    question: "How does economic output per resident differ across the included regions?",
    interpretation: "Dividing regional output by population changes the question from economic scale to output per resident. It does not establish the wage, disposable income or wealth of a typical household.",
    decision: "Read this beside total output and the population denominator. Check whether production and resident population refer to the same geographical boundaries and period before interpreting a small gap.",
    limitation: "Average output hides its distribution. Commuting and the location of production can also make a regional per-person figure different from the resources available to residents.",
  },
  "building-height": {
    question: "Which buildings in the included list have the greatest reported height?",
    interpretation: "Building height is a physical measurement rather than a count of floors, usable space or occupants. Those measures can produce different orderings and should not be inferred from height alone.",
    decision: "Check whether the cited table uses architectural height, roof height or another convention, and whether it includes completed, topped-out or proposed structures. Compare buildings only under compatible definitions.",
    limitation: "Compiled building lists can change as structures are completed or remeasured. The snapshot is not a record of every structure, and a location’s absence does not establish that it has no tall buildings.",
  },
  "airport-traffic": {
    question: "Which included airports handled the largest reported passenger totals?",
    interpretation: "Passenger throughput describes reported traffic during a period. It is different from the number of unique people, flight movements, cargo volume or runway size.",
    decision: "Check whether transit passengers and domestic or international traffic are included in the same way. Use the source’s reporting year rather than a current flight schedule when comparing totals.",
    limitation: "Airport traffic can change between reporting periods. This snapshot does not establish service quality, destination choice or the availability of a particular route.",
  },
  "product-picks": {
    question: "Which source-listed product fits the need described in its selection note?",
    interpretation: "The item notes record the named publisher’s selection context. Category winners can address different priorities, so their order is not necessarily a common performance scale. A list position does not say how large any performance difference is.",
    decision: "Begin with your use case, then compare the exact model or formulation and the limitation in its note. Check the original review for testing conditions and current local availability before choosing.",
    limitation: "AllRanks compared the source list; it did not use or laboratory-test these products. Prices, formulations and availability can change. The numbers used for source order must not be subtracted or averaged as performance scores.",
  },
  "binary": {
    question: "Which included entries report yes and which report no under this definition?",
    interpretation: "This is a coded yes/no measure: one means yes and zero means no. Sorting the codes creates two groups, not a continuous scale of performance. Entries sharing a code do not have different measured values.",
    decision: "Read the exact condition in the definition before interpreting a yes. A legal rule’s presence, for example, does not by itself establish how effectively it is implemented. Use the groups and item definitions instead of treating name-ordered positions as meaningful differences.",
    limitation: "The source’s coding rule and reporting coverage determine what the two values mean. Missing observations are different from a recorded no; neither should be filled by assumption.",
  },
  "projection": {
    question: "What does the specified projection imply for the included entries?",
    interpretation: "A projection is a modeled outcome under a defined set of assumptions. It is not a count of events already observed. The population group, horizon and scenario in the indicator name are essential parts of the measure.",
    decision: "Compare only the same scenario, horizon and population definition. Read the publisher’s assumptions before using the position to describe a future outcome; use observed series separately to describe what has already happened.",
    limitation: "A numerical ordering does not establish forecast certainty. Different assumptions can produce different results, and a single projected value is not an uncertainty interval.",
  },
  "local-currency": {
    question: "What does this local-currency series describe within each economy?",
    interpretation: "The unit is local currency. One unit of one country’s currency is not equivalent to one unit of another’s. Consequently, cross-country sorting of these raw amounts does not establish which economy has the largest comparable value.",
    decision: "Use the source’s within-country series or a consistently converted common-currency or purchasing-power measure. AllRanks does not apply an exchange rate merely because two values appear in this table.",
    limitation: "This ordering is a display of recorded amounts, not a valid common-currency league table. Currency redenominations and price bases also matter over time. Cross-entry difference calculations are disabled for this series.",
  },
  "score": {
    question: "How do the included entries compare on this defined assessment scale?",
    interpretation: "A score or index summarizes a publisher’s assessment under its stated methodology. The distance between two scores need not be a proportional difference in the underlying condition; twice the score does not automatically mean twice the performance.",
    decision: "Read the scale direction, components and weighting before interpreting the position. For a policy or institutional assessment, inspect the component measures and source methodology to understand what contributed to the result.",
    limitation: "Method changes, rounding and shared scores can affect apparent gaps. A score is not a direct count of the underlying condition, and a small numerical difference does not establish statistical significance.",
  },
  "share": {
    question: "What share of the stated denominator does this measure represent?",
    interpretation: "A percentage must be read with its denominator. A high share can result from a larger numerator, a smaller denominator, or both; it does not by itself establish a large absolute amount.",
    decision: "Keep the denominator in the indicator name when comparing entries. Use a matching total-count or total-value series to investigate scale. A difference between percentage-valued observations is expressed in percentage points, not a percentage change.",
    limitation: "Different population groups, coverage or reporting definitions can make superficially similar percentages incompatible. Do not assume every percentage must lie between zero and one hundred: ratios to a benchmark or economic aggregate can legitimately exceed that range.",
  },
  "per-person": {
    question: "How does the recorded amount compare after adjusting for the stated population?",
    interpretation: "A per-person measure divides an amount by a specified population. It describes an average, not what every individual receives or uses, and it can move when either the total or population changes.",
    decision: "Check whether the denominator is all residents, adults, workers or another group. Compare the matching total if you need scale, and use household or distributional data to investigate individual circumstances.",
    limitation: "The population denominator and numerator need compatible dates and coverage. An average can hide wide differences within an entry and does not establish a typical person’s outcome.",
  },
  "growth": {
    question: "Which included entries have the largest change relative to their starting level?",
    interpretation: "A growth rate describes proportional change, not the absolute increase in the measured amount. A smaller base can produce a large percentage change without producing the largest additional volume.",
    decision: "Read the rate beside the starting level and the publisher’s time interval. Check whether the series is adjusted for prices before using it to describe real rather than nominal change.",
    limitation: "One period does not establish a durable trend or its cause. Revisions, rebound effects and differing base periods need examination before attributing the result to a particular policy or event.",
  },
  "stock": {
    question: "How large is the recorded stock at the stated reference point?",
    interpretation: "A stock describes an accumulated amount or balance at a point in time. It is different from a flow produced or used during a year, so the two should not be substituted in a comparison.",
    decision: "Check the valuation basis and reporting date. When investigating change, use compatible observations from successive dates rather than comparing a stock with an annual flow as if they had the same unit.",
    limitation: "Revaluations and revisions can change a stock without an equivalent transaction or physical change. The table alone does not identify the source of the difference.",
  },
  "flow": {
    question: "How much activity is recorded over the stated reporting period?",
    interpretation: "This measure describes an amount during a period. More recorded activity does not automatically mean more activity per resident, greater efficiency or a better outcome.",
    decision: "Match the time interval and unit before comparing entries. If the question is about intensity, use a compatible population, production or other denominator rather than inferring it from a total.",
    limitation: "Changes in reporting coverage can affect totals. A country or entity absent from the list is not a recorded zero, and a difference in totals alone cannot establish a cause.",
  },
  "price": {
    question: "How do the included prices compare under the source’s quotation basis?",
    interpretation: "A quoted price concerns a defined product, market and date. It is different from affordability, which also depends on income, and from inflation, which measures change over time.",
    decision: "Match the product specification, quantity, tax treatment and quotation date. For currency-converted prices, check the exchange-rate basis before interpreting a small difference.",
    limitation: "A national or benchmark price does not guarantee the price available to a particular buyer. This snapshot does not establish price stability, household purchasing power or total ownership cost.",
  },
  "survey": {
    question: "What does this survey-based measure describe about the covered population?",
    interpretation: "A survey result describes responses or estimates under the publisher’s question and sampling method. The exact wording and population determine what the number can support.",
    decision: "Check the sample, fieldwork date and weighting before comparing entries. Treat percentages as shares of the stated respondent population rather than counts of all residents unless the source explicitly supplies that inference.",
    limitation: "Sampling and measurement uncertainty can make close values hard to distinguish. The stored point estimates do not provide a margin of error unless the source explicitly supplies one.",
  },
  "chart": {
    question: "What does this platform or publisher’s ordering actually measure?",
    interpretation: "Chart positions and platform popularity describe a defined audience, window and counting rule. They are not a universal quality assessment or a complete measure of all consumption outside that platform.",
    decision: "Check whether the source uses sales, streams, viewing time, views or peak simultaneous activity. Compare editions using the same rule and window rather than treating different chart types as interchangeable.",
    limitation: "An ordinal position does not quantify the gap between entries. Cumulative totals and short-window peaks answer different questions, and a platform result does not represent every possible audience.",
  },
  "ordinal": {
    question: "What does a position in the source’s published order establish?",
    interpretation: "An ordinal list establishes an order, not the size of a performance gap. The difference between positions one and two need not equal the difference between positions two and three.",
    decision: "Use the source’s stated selection and ordering criteria. If numerical scores are not published, follow the order without inventing values or treating the position as a measured quantity.",
    limitation: "A shortlist may cover selected categories or eligible entries rather than the full population. Its first item should not be described as universally best without supporting source evidence.",
  },
  "economic-output": {
    question: "How large is the output or income aggregate under this accounting definition?",
    interpretation: "An economic aggregate summarizes a defined set of production or income flows. GDP and national income are related but answer different accounting questions; neither is the income of a typical household.",
    decision: "Read the current or constant-price basis and any purchasing-power conversion. For living standards, inspect a matching per-person measure and its population rather than transferring the total-output position to residents.",
    limitation: "The accounting boundary, valuation basis and reference year affect the comparison. A current-dollar amount cannot establish real growth without a compatible time series.",
  },
  "population-count": {
    question: "How many people belong to the population group specified in this indicator?",
    interpretation: "A population count describes the stated group, age range, sex and geographical coverage. A large subgroup count can result from a large total population without a high subgroup share.",
    decision: "Keep every qualifier in the indicator name. Compare a compatible population share when asking how common the group is, and use a consistent time series when asking whether it is growing.",
    limitation: "Counts, modeled estimates, interpolations and census observations have different provenance. The table does not measure individual circumstances, and different boundaries or dates can affect the comparison.",
  },
  "policy-assessment": {
    question: "What does this specific policy condition or assessment component describe?",
    interpretation: "A legal-framework indicator, a supportive-framework measure and an enforcement-perception score describe different evidence. A rule on paper should not be relabeled as its measured implementation or as every resident’s experience.",
    decision: "Read the exact condition and coding rule in the publisher definition. When a component is coded into categories, treat equal codes as a shared recorded answer rather than a finely graded performance difference.",
    limitation: "The legal scope, respondent evidence and scoring method matter. A component score is not a complete legal assessment or advice about the law applicable to a particular person.",
  },
  "capital-valuation": {
    question: "What kind of asset or wealth valuation is being compared?",
    interpretation: "Capital and wealth accounts assign values to assets under an accounting framework. A valuation is not necessarily a market sale, an annual cash receipt or a directly measured physical quantity.",
    decision: "Keep the asset class, per-person or total basis, currency and price base together. Compare a compatible physical or flow series separately if the question concerns extraction, use or annual income.",
    limitation: "Changes in valuation assumptions can change the amount without an equivalent physical change. Do not add overlapping asset components or mix current and chained-price estimates without the publisher’s accounting method.",
  },
  "duration": {
    question: "How much time is associated with the defined process or outcome?",
    interpretation: "A duration uses a time unit, rather than a count of people or events. Read whether it refers to a completed process, a requirement, an expected period or an average observation.",
    decision: "Match the event definition and population before comparing durations. A shorter reported time is not automatically evidence of a better overall service or outcome if the process or eligibility differs.",
    limitation: "A reported average does not describe every case or its variability. Missing durations should not be replaced with zero, and the reference period matters when procedures change.",
  },
  "speed": {
    question: "What does the measured connection speed describe for the included users or tests?",
    interpretation: "Connection speed describes data transfer under a measurement method. It does not establish the proportion of people online, connection affordability or the performance at every address.",
    decision: "Check the device or access type and the source’s aggregation method. Compare fixed and mobile services separately, and read the internet-use share when the question is population access.",
    limitation: "Test coverage and network conditions affect the observed sample. A national value does not guarantee a particular household’s speed, and small gaps are not reliability estimates.",
  },
  "capacity": {
    question: "How much capacity is recorded, and what would count as actual use?",
    interpretation: "Capacity describes capability under the source’s definition. Installed electrical power or computing capability is different from measured energy consumption, executed work or utilization.",
    decision: "Keep power, energy and computing units separate. Check the source inventory’s inclusion rule and do not infer actual utilization from capacity alone.",
    limitation: "Public inventories can miss undisclosed systems or revise technical specifications. The value does not by itself establish actual usage, efficiency or the performance of every application.",
  },
  "density": {
    question: "How much of the measured population or activity is recorded per unit of area?",
    interpretation: "A density divides a count by area. A high density can reflect a large count, a small boundary or both; it is different from the total size of the population or activity.",
    decision: "Match the area definition and count date. Administrative density and the density of a built-up area answer different questions, so preserve the geographical boundary in any comparison.",
    limitation: "A single average can hide substantial variation within an area. It does not identify where residents or activity are concentrated inside the boundary.",
  },
  "household-size": {
    question: "How many people correspond to each household under this definition?",
    interpretation: "An average household size relates population to the number of households. It is not the population of a typical dwelling or a count of household types.",
    decision: "Match the definition of household, the population included and the census or survey date. Inspect distributions when asking how common very small or large households are.",
    limitation: "The average can be the same for places with different household-size distributions. Institutional and other non-household populations may be treated differently by the original source.",
  },
  "ratio": {
    question: "Which quantities are related by this ratio?",
    interpretation: "A ratio compares a specified numerator with a specified denominator. A high ratio does not by itself establish a large numerator or a desirable result.",
    decision: "Read both quantities and any multiplier in the label. Compare like denominators and units; a sex ratio, exchange-rate index and financial ratio cannot be treated as the same kind of performance measure.",
    limitation: "A change can come from either side of the ratio. The table alone does not identify which quantity changed or whether the underlying populations are comparable.",
  },
  "net-flow": {
    question: "What does the recorded balance or net movement mean?",
    interpretation: "A net amount subtracts one direction of activity from another. A small net balance can coexist with large movements in both directions. Its sign is part of the definition.",
    decision: "Read the source’s inflow and outflow convention before interpreting positive or negative values. Look at gross components separately if the question concerns total activity.",
    limitation: "A net amount does not reveal the size of each component. A change in the balance alone cannot establish the cause or the experience of every affected person or organization.",
  },
  "money-flow": {
    question: "How large is the stated payment, expenditure or revenue flow?",
    interpretation: "A monetary flow measures an amount over a period under a specified accounting definition. Receipts, payments, revenue and profits are distinct quantities, even when quoted in the same currency.",
    decision: "Match the reporting period, currency and price basis. For scale relative to population or the economy, open a compatible per-person or share measure rather than inferring it from the total.",
    limitation: "The stored amount does not establish who ultimately benefits or bears the cost. Aggregation, currency conversion and different reporting boundaries can affect the comparison.",
  },
  "company-revenue": {
    question: "Which included organizations report the largest revenues?",
    interpretation: "Revenue describes sales or operating receipts under an accounting definition. It is different from profit, market value and cash available to shareholders.",
    decision: "Match the fiscal year and reporting scope before comparing companies. Use profitability and valuation measures separately if your question concerns earnings or the price of ownership.",
    limitation: "Consolidation, financial reporting conventions and exchange rates can affect the comparison. This table is not an investment recommendation or a forecast of future returns.",
  },
  "market-value": {
    question: "How large is the stated market valuation at the reference point?",
    interpretation: "Market value describes valuation under a price and coverage rule. It is different from annual revenue, the value of national production or a guaranteed amount realizable in a sale.",
    decision: "Check the quotation date and eligible securities or markets. Use matching dates and currency conversions before comparing a valuation with another source.",
    limitation: "Prices and market coverage can change. The recorded position does not establish investment quality, expected return or the safety of holding an asset.",
  },
  "wealth-count": {
    question: "How many people meet the source’s stated wealth threshold?",
    interpretation: "A millionaire or billionaire count depends on the wealth threshold, valuation date and eligibility rule. A large count is different from a large share of residents or a typical household’s wealth.",
    decision: "Check residence or citizenship attribution and the currency threshold. Use population-adjusted counts for prevalence and distributional measures to investigate how wealth is shared.",
    limitation: "Asset prices and estimation methods affect who crosses the threshold. The list is an estimate under its source definition, not a registry of every person’s finances.",
  },
  "education-count": {
    question: "What education population or activity is included in this measure?",
    interpretation: "Enrollment, staffing and out-of-school counts describe different parts of an education system. None alone establishes learning quality or the result for a particular student.",
    decision: "Keep the education level and age group in the definition. For access or resources per student, use a compatible participation rate or ratio rather than a raw count.",
    limitation: "Enrollment is not necessarily attendance or completion. Administrative and survey coverage, reference dates and institution definitions should be checked before comparing totals.",
  },
  "event-count": {
    question: "How many events or units are recorded under this source definition?",
    interpretation: "A count measures the included events or units. It is different from a rate, a probability or an assessment of the impact of each event.",
    decision: "Match the event definition and reporting window. Compare a population-adjusted measure for incidence and inspect source coverage before comparing a large and small country.",
    limitation: "A count can change when reporting expands or classifications change. The stored total does not identify unreported events or establish why the difference occurred.",
  },
  "audience-total": {
    question: "What kind of sales, consumption or audience activity does this total count?",
    interpretation: "Copies sold, streams, views and box-office receipts are different measures. A lifetime total also answers a different question from a weekly chart or a peak simultaneous audience.",
    decision: "Keep the counting rule and time window in every quotation. Match platform and product coverage before comparing this result with a chart elsewhere.",
    limitation: "A large total does not establish quality, the number of unique users or current demand. Reissues, repeat consumption and coverage rules may affect the count.",
  },
  "compensation": {
    question: "What earnings or compensation definition is used for these entries?",
    interpretation: "Earnings, awarded compensation and realized take-home pay are different quantities. The reporting period and included components determine what the amount supports.",
    decision: "Read the source note for salary, grants, bonuses and any cohort restriction. Compare matching definitions rather than interpreting every dollar figure as spendable annual pay.",
    limitation: "A group-level or award-based value does not predict an individual’s future earnings. Selection, reporting coverage and valuation conventions can affect the ordering.",
  },
  "health-rate": {
    question: "What health outcome or population rate is defined by this indicator?",
    interpretation: "A health rate relates a defined event or condition to a specified population and period. It is not an individual diagnosis or a complete measure of health-system performance.",
    decision: "Match the age range, adjustment basis, outcome definition and denominator. Counts and rates should be read separately, especially when populations differ in size or age composition.",
    limitation: "Reporting and ascertainment can differ. A stored point estimate alone does not supply an uncertainty interval or identify the cause of a difference.",
  },
  "p-value": {
    question: "What evidence does this p-value provide under the specified statistical model?",
    interpretation: "A p-value is a model-based statistical quantity. It is not the size of a wage premium, the probability a hypothesis is true or a direct score of country performance.",
    decision: "Read the tested comparison, assumptions and estimated effect together. Do not select a policy conclusion from an isolated threshold or compare p-values as if they measured effect size.",
    limitation: "Sample size and modeling choices affect statistical results. The snapshot does not supply enough context to infer a practical effect from the p-value alone.",
  },
  "wage-premium": {
    question: "How are public-sector pay and the stated comparison group related in this measure?",
    interpretation: "A wage-premium estimate compares pay under a defined group and estimation method. It is different from an absolute salary and may depend on the characteristics the model adjusts for.",
    decision: "Preserve the occupational or gender group and the comparison group specified in the title. Read the publisher’s method before describing the difference as a causal effect of public-sector employment.",
    limitation: "The stored estimate does not show every worker’s pay or prove equal work and equal characteristics across groups. Uncertainty and model specification must be checked separately.",
  },
  "age-statistic": {
    question: "What does this mean or median age summarize about the specified worker group?",
    interpretation: "A mean and a median summarize age differently. A group’s median age is a middle observation, rather than a count of workers or a statement that every worker is that age.",
    decision: "Keep the public or private employment group and the type of summary in any comparison. Read the source’s sampling and workforce definitions before treating a difference as demographic change.",
    limitation: "Similar averages can hide different age distributions. A single summary does not establish recruitment, retirement or the experience of every worker.",
  },
  "sample-size": {
    question: "How many observations contribute to the source sample?",
    interpretation: "Sample size describes the amount of sampled information, not the size of the total population or a substantive country outcome. More sampled observations are not automatically a better result on the topic being studied.",
    decision: "Read the sampling design, target population and weighting before interpreting representativeness. The source sample is a denominator for understanding evidence, rather than a performance league table.",
    limitation: "A large sample alone cannot eliminate selection or measurement bias. The count does not supply an uncertainty estimate without the survey or estimation design.",
  },
  "physical-area": {
    question: "How much land or covered area is included under this definition?",
    interpretation: "An area measure describes extent within a specified boundary or land-cover definition. It is different from population density, land quality or a rate of change.",
    decision: "Keep hectares, square kilometres and any forest or coastal classification distinct. For loss or change indicators, check the interval and classification before interpreting the number as the current total area.",
    limitation: "Mapped estimates and boundary choices can affect the result. The area alone does not establish ecological condition, legal protection or the cause of a land-cover change.",
  },
  "arms-volume": {
    question: "What volume of major conventional arms transfers does the TIV measure describe?",
    interpretation: "SIPRI trend-indicator values are a common measure for the volume of arms transfers. They are not sale prices or defence budgets, so the units should not be relabeled as dollars.",
    decision: "Use the delivery period and the source coverage for major conventional weapons. Compare financial spending separately rather than converting TIV into expenditure without a supported method.",
    limitation: "The recorded transfers do not describe every defence transaction, every weapon type or a country’s complete military capability. The source’s transfer and attribution conventions matter.",
  },
  "port-throughput": {
    question: "How much container handling is recorded at each included port?",
    interpretation: "A TEU is a twenty-foot-equivalent container unit. Container handling throughput is not the number of unique containers, tonnes of cargo or the port’s revenue.",
    decision: "Keep the reporting year and port boundary fixed. Check the source’s treatment of transshipment and port groups before comparing figures with a differently defined terminal or city.",
    limitation: "Throughput does not by itself establish capacity, efficiency or trade value. The list includes the source’s eligible ports rather than every cargo facility.",
  },
  "standardized-test": {
    question: "What does the reported test statistic describe about the covered students?",
    interpretation: "A reported standardized-test average describes the included test takers under a specified test and reporting convention. It is not a direct measure of every student’s ability or teaching quality.",
    decision: "Check the covered cohort, score components and reporting year. Read admission selection and participation context before treating an institutional average as an effect of attending that institution.",
    limitation: "Different participation and admission patterns can affect averages. The snapshot does not predict an individual’s outcome or establish a causal effect of the institution.",
  },
  "financial-spread": {
    question: "Which financial rates are being compared in this spread?",
    interpretation: "A spread is a difference between specified rates rather than a standalone price or a direct measure of profit. The definitions of both rates are part of the statistic.",
    decision: "Check the lending and deposit categories and reporting period. For percent-valued rates, distinguish a percentage-point spread from a proportional percentage change.",
    limitation: "The spread alone does not establish the cost or return available to a particular customer. Maturity, risk and product coverage may differ in the underlying rates.",
  },
  "job-change": {
    question: "Which included sectors gained or lost the most jobs over the stated interval?",
    interpretation: "Net employment change subtracts the earlier employment stock from the later one. It differs from the count of all hires and from the size of the workforce in the sector.",
    decision: "Keep the start and end dates and seasonal-adjustment basis together. A smaller sector can show a high percentage change but a smaller net count; those comparisons answer different questions.",
    limitation: "Preliminary estimates and revisions can affect the change. The total alone does not establish why jobs changed, wage quality or the experience of a particular worker.",
  },
  "meta-ranking": {
    question: "What does an average of published league-table positions summarize?",
    interpretation: "This measure combines positions from source rankings. Positions describe order under each ranking’s criteria; averaging them does not turn those criteria into a common directly measured quality scale.",
    decision: "Inspect the component rankings, edition years and handling of missing institutions before using the average. Use subject-specific evidence and course information separately for an education decision.",
    limitation: "A composite position can hide disagreement between component rankings. It does not establish a uniform score difference, teaching quality or the suitability of an institution for an individual student.",
  },
  "safety-rating": {
    question: "What does the source’s published test rating establish about these models?",
    interpretation: "A test rating summarizes results under the testing body’s defined method. It is distinct from a general product recommendation or a guarantee of performance in every real-world situation.",
    decision: "Check the exact model and the rating method at the original testing body. Equal published ratings should be read as the same reported category, rather than different quality levels implied by alphabetical table positions.",
    limitation: "AllRanks did not perform the tests. The rating is not a substitute for correct product fit, applicable requirements or use according to the manufacturer’s instructions. A difference in rating is not a proportional change in safety.",
  },
  "measure": {
    question: "What can this specific measure tell us about the included entries?",
    interpretation: "The indicator’s definition and unit set the meaning of this comparison. A numerical ordering describes that measure, not every aspect of an entry’s performance or quality.",
    decision: "Begin with the measurement definition, then match the reference period and included population. Use the item notes to resolve differences in scope before making a comparison with another source.",
    limitation: "The table does not provide causal evidence or uncertainty bounds unless the source states them. Further conclusions require compatible supporting data, rather than a stronger claim based on the same position.",
  },
};

/** Explicit semantic precedence prevents treating projections, codes or local money as a league table. */
export function editorialProfile(r: Ranking): EditorialProfile {
  const text = `${r.title} ${r.unit} ${r.source.name}`.toLowerCase();
  const url = r.source.url ?? "";
  let id = "measure";
  if (url.includes("openalex.org")) id = r.id.endsWith("research-h-index") ? "research-h-index" : r.id.endsWith("research-i10-index") ? "research-i10-index" : r.id.endsWith("research-publications") ? "research-publications" : r.id.endsWith("recent-research-citedness") ? "research-recent" : "research-citations";
  else if (url.includes("ourairports.com")) id = r.id.endsWith("longest-runways") ? "airport-runway" : "airport-elevation";
  else if (url.includes("geonames.org")) id = r.id.endsWith("cities-by-elevation") ? "city-elevation" : "city-population";
  else if (/SHARP rating/i.test(r.unit)) id = "safety-rating";
  else if (r.entityType === "product" && r.category === "everyday") id = "product-picks";
  else if (r.unit === "yes/no (1=yes)" || /1\s*=\s*(?:yes|banking crisis).*0\s*=\s*(?:no|none)/.test(text)) id = "binary";
  else if (/projection|projected|scenario/.test(text)) id = "projection";
  else if (/\blcu\b|local currency/.test(text)) id = "local-currency";
  else if (/^wbl:/.test(r.title.toLowerCase())) id = "policy-assessment";
  else if (/skyscraper|tallest building/.test(text)) id = "building-height";
  else if (r.scope && /gdp|grdp|gross (regional|state|domestic) product/.test(text)) id = /per (capita|person|head)/.test(text) ? "regional-gdp-person" : "regional-gdp";
  else if (r.scope && /passengers|busiest airports/.test(text)) id = "airport-traffic";
  else if (r.scope && /largest (cities|municipalities|communes)|cities by population/.test(text)) id = "city-population";
  else if (r.scope && /population/.test(text) && !/growth|density|ratio|share|percent|%/.test(text)) id = "regional-population";
  else if (/opinion-way|happiness/.test(url)) id = "survey";
  else if (/billboard|netflix|steamdb|oricon|duolingo/.test(url)) id = "chart";
  else if (/\brank\b|chart position/.test(text) || r.prefix === "#") id = "ordinal";
  else if (/price|cost of|gasoline/.test(text) && !/inflation|index|growth|%/.test(text)) id = "price";
  else if (/growth|annual.*change|change.*annual/.test(text)) id = "growth";
  else if (/score|index|rating|scale [0-9]/.test(text)) id = "score";
  else if (/per capita|per person|per adult|per worker|per 100|per 1,000|per 100,000/.test(text)) id = "per-person";
  else if (r.suffix.includes("%") || /%|percent|share/.test(r.unit.toLowerCase())) id = "share";
  else if (/density|people\/km/.test(text)) id = "density";
  else if (/population|labou?r force.*total|labou?r force.*female|labou?r force.*male/.test(text)) id = "population-count";
  else if (/capital,|capital per|capital stock|wealth account|nonrenewable natural|renewable natural|net foreign assets|net foreign liabilities/.test(text)) id = "capital-valuation";
  else if (/reserves|wealth|total assets|debt stock/.test(text)) id = "stock";
  else if (/production|consumption|exports|imports|generation|revenue|emissions|expenditure/.test(text)) id = "flow";
  if (id === "measure") {
    if (/average household|household size/.test(text)) id = "household-size";
    else if (/density|people\/km/.test(text)) id = "density";
    else if (/speed|mbps/.test(text)) id = "speed";
    else if (/capacity|ai.*(?:supercomput|cluster|compute)|top500/.test(text)) id = "capacity";
    else if (/billionaires|millionaires/.test(text)) id = "wealth-count";
    else if (/market cap|market value|stock markets/.test(text)) id = "market-value";
    else if (/revenue|companies/.test(text)) id = "company-revenue";
    else if (/earnings|compensation|paid ceos/.test(text)) id = "compensation";
    else if (/gdp|gni|gross.*(?:product|income)|value added/.test(text)) id = "economic-output";
    else if (/net |balance|migration/.test(text)) id = "net-flow";
    else if (/years|days|hours|duration|time |time$|starting age/.test(text)) id = "duration";
    else if (/ratio|relative/.test(text)) id = "ratio";
    else if (/population|refugees|displaced|asylum|public.*(?:workers|employment)|public work/.test(text)) id = "population-count";
    else if (/enroll|teachers|school|education/.test(text)) id = "education-count";
    else if (/sales|selling|streamed|grossing|albums|films/.test(text)) id = "audience-total";
    else if (/receipts|payments|remittance|expenditure|spending|consumption|exports|imports|savings|formation|transfers/.test(text)) id = "money-flow";
    else if (/mortality|survival|stunting|health/.test(text)) id = "health-rate";
    else if (/visits|count|objects|vehicles|homicide|systems|laureates|households/.test(text)) id = "event-count";
  }
  if (/p-value/i.test(r.title)) id = "p-value";
  else if (/wage premium/i.test(r.title)) id = "wage-premium";
  else if (/mean age|median age/i.test(r.title)) id = "age-statistic";
  else if (/sample size/i.test(r.title)) id = "sample-size";
  else if (/SIPRI TIV/i.test(r.unit)) id = "arms-volume";
  else if (/TEUs/i.test(r.unit)) id = "port-throughput";
  else if (/SAT points/i.test(r.unit)) id = "standardized-test";
  else if (/lending-deposit spread/i.test(r.title)) id = "financial-spread";
  else if (r.id === "us-industry-job-change-2026") id = "job-change";
  if (id === "measure") {
    if (/H100-equivalent|computing power/.test(`${r.unit} ${r.title}`)) id = "capacity";
    else if (/towns|localities|urban areas|cities/i.test(r.title)) id = "city-population";
    else if (/Economic Fitness|Governance estimate/i.test(r.title)) id = "score";
    else if (/Human capital|Produced capital|Foreign assets|Foreign liabilities/i.test(r.title)) id = "capital-valuation";
    else if (/stunted|fraction of children/i.test(r.title)) id = "health-rate";
    else if (/employed individuals|paid employees/i.test(r.title)) id = "population-count";
    else if (/hectares|km²|forest loss|coastal protection/i.test(`${r.title} ${r.unit}`)) id = "physical-area";
    else if (/enrollment|public universities/i.test(r.title)) id = "education-count";
    else if (/USD|US\$/i.test(r.unit)) id = "money-flow";
  }
  if (r.id === "gb-universities") id = "meta-ranking";
  if (r.id === "wbx-gfdd-oi-07") id = "stock";
  return { id, ...profiles[id] };
}
