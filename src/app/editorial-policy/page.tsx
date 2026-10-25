import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = pageMetadata("Editorial policy and corrections", "Who prepares AllRanks explanations, what source verification means, how comparisons are calculated and how to request a correction.", "/editorial-policy");
export default function EditorialPolicyPage() {
  return <>
    <div className="page-head"><h1>Editorial policy &amp; corrections</h1><p>What we checked, what we calculated and what the data cannot establish.</p></div>
    <div className="prose">
      <h2>Our purpose</h2><p>AllRanks helps readers compare published data across countries and understand the measure behind a position. Our <Link href="/guides">reading guides</Link> connect related questions about economic scale, prices, employment, connectivity and research.</p>
      <h2>Who prepares the content</h2><p>The AllRanks assistant prepares the reading guides and the rules used to compose dataset explanations. Every public ranking receives an AI-assisted explanation using its stored definition, unit, coverage and calculated observations. These explanations share reviewed measurement-specific writing rules; they are not thousands of independently researched or expert-reviewed essays. They do not imply review by an economist, statistician or product-testing laboratory. AllRanks is responsible for publication and corrections; the original publishers remain responsible for their own datasets.</p>
      <h2>Three kinds of information</h2><ul>
        <li><strong>Published observations:</strong> values and source-list positions collected from the named publisher, with a reference period and collection date.</li>
        <li><strong>AllRanks calculations:</strong> sorting, differences, medians and visualizations computed from the listed entries. These do not add observations for missing entries.</li>
        <li><strong>Interpretation:</strong> source-backed explanations and reading suggestions. Hypothetical examples are labeled and do not represent measured country results.</li>
      </ul>
      <h2>What an explanation’s sources establish</h2><p>World Bank indicator metadata are retrieved separately from observation values. A short definition excerpt is labeled and linked to the full publisher definition; some metadata records do not contain definition text. Source accessibility checks record whether a URL responded, not whether the entire page was reviewed or every number was verified. If a source could not be retrieved in that check, we disclose that limitation.</p>
      <p>The explanation identifies the measure, shows calculations from the stored entries, explains how to use it and names relevant limitations. Measurement rules distinguish projections, local-currency amounts, binary codes, ordinal lists, survey results and numerical observations. The same writing rule can apply to more than one dataset; the observations and coverage remain specific to each page.</p>
      <h2>Source checking is not firsthand testing</h2><p>Manually and AI-collected lists require the AllRanks assistant to compare the entries, order, units and edition with linked sources before publication. Unverified drafts stay private. Automated datasets undergo collection and validation checks; that is not a claim that every observation has been independently audited.</p>
      <p>For product lists, the named publisher performed any reported testing. AllRanks has not used or laboratory-tested the products. Source-specific category winners may serve different needs and are not converted into invented performance scores.</p>
      <h2>How we choose comparisons</h2><p>We keep different units, denominators and reference periods separate. A highest or lowest listed value is a position within the included data, not an overall rating of a country. Shared methodology notes are distinguished from explanations written for a particular measure. More entries and newer collection dates do not automatically make a comparison more complete.</p>
      <h2>Updates and corrections</h2><p>Guide review dates record a review of the explanation and linked definitions. Dataset collection dates record snapshot retrieval or compilation. Neither date changes the underlying reference period. Refreshes depend on source availability; there is no guaranteed daily review of every page.</p>
      <p>To request a correction, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with the page URL, disputed value or statement, and a supporting source. We compare the report with the original material before changing it. Corrections must preserve attribution and the meaning of the source; unresolved manual lists remain unpublished.</p>
      <h2>Advertising and editorial choices</h2><p>Advertising is paused while we improve the collection. Publisher identification remains available for site verification. Advertising approval does not certify the accuracy of a ranking, and a source’s commercial recommendation is not an AllRanks product endorsement.</p>
      <p>Read the <Link href="/methodology">collection methodology</Link> and <Link href="/privacy">privacy policy</Link>.</p>
    </div>
  </>;
}
