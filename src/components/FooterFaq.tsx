import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { CONTACT_EMAIL } from "@/lib/site";

type AnswerPart = { text: string; href?: string };
type Faq = { question: string; answer: AnswerPart[] };

const faqs: Faq[] = [
  {
    question: "What can I find on AllRanks?",
    answer: [
      { text: "Explore world and country-level rankings across topics such as the economy, education, technology and everyday essentials. Pick a country on the globe, browse a category, or " },
      { text: "search for a country, topic or entry", href: "/search" },
      { text: "." },
    ],
  },
  {
    question: "Where do the rankings come from?",
    answer: [
      { text: "AllRanks brings together published datasets and source lists. Each ranking shows its source, reference period and collection date, with links to the original material when available. Read our " },
      { text: "collection and verification methodology", href: "/methodology" },
      { text: "." },
    ],
  },
  {
    question: "Are all rankings from the current year?",
    answer: [
      { text: "No. A source’s latest available data can refer to an earlier year. Check the reference period on each ranking; the collection date tells you when AllRanks fetched the snapshot, not when the underlying events happened. Some editions are published in a different year from their data." },
    ],
  },
  {
    question: "Does being ranked #1 always mean being the best?",
    answer: [
      { text: "No. Position follows the metric and its sorting direction. A ranking might put the highest price or the lowest value first. Read the definition, unit and ranking direction before interpreting a position. Category-specific product picks may also have different purposes rather than being direct comparisons." },
    ],
  },
  {
    question: "How are rankings checked and updated?",
    answer: [
      { text: "Automated collectors refresh supported datasets and run checks before publishing. Manually and AI-collected lists require comparison with the linked sources before publication; unverified drafts stay private. Update timing depends on the source and collection process. See " },
      { text: "how the checks work", href: "/methodology" },
      { text: "." },
    ],
  },
  {
    question: "Can I compare results from different rankings?",
    answer: [
      { text: "Check that the definitions, units, reference periods and coverage match first. Two rankings can measure different things even when their names sound similar. A missing entry does not mean its value is zero." },
    ],
  },
  {
    question: "How can I report an error or suggest a ranking?",
    answer: CONTACT_EMAIL
      ? [
          { text: "Email " },
          { text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
          { text: " with the ranking link, what needs changing and a supporting source if you have one. Suggestions are welcome; publication depends on source availability and verification." },
        ]
      : [
          { text: "Visit our " },
          { text: "About page", href: "/about" },
          { text: " for contact information. Suggestions are welcome; publication depends on source availability and verification." },
        ],
  },
];

function renderAnswerPart(part: AnswerPart, key: number) {
  if (!part.href) return part.text;
  if (part.href.startsWith("mailto:")) return <a key={key} href={part.href}>{part.text}</a>;
  return <Link key={key} href={part.href}>{part.text}</Link>;
}

export default function FooterFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer.map(({ text }) => text).join(""),
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="footer-faq" aria-labelledby="footer-faq-title">
        <div className="footer-faq-intro">
          <h2 id="footer-faq-title">Frequently asked questions</h2>
          <p>Quick answers about exploring and reading AllRanks.</p>
        </div>
        <div className="footer-faq-items">
          {faqs.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer.map(renderAnswerPart)}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
