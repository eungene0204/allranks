import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ADSENSE_CLIENT, CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata('Privacy Policy', 'AllRanks privacy policy and how advertising cookies work on this site.', '/privacy');

export default function PrivacyPage() {
  return (
    <>
      <div className="page-head">
        <h1>Privacy Policy</h1>
        <p>Last updated: October 14, 2026</p>
      </div>
      <div className="prose">
        <h2>What we collect</h2>
        <p>
          AllRanks has no accounts, no sign-in and no forms that ask for personal information. We do not store personal data about
          visitors, and we do not run our own analytics or tracking.
        </p>
        <p>
          Like any website, the server that delivers pages may keep standard technical logs (such as IP address, requested page and time) for security and
          operation. This includes the text of a search if you use the search page, because it is part of the page address. We do not use these logs to identify you.
        </p>

        <h2>Advertising</h2>
        {ADSENSE_CLIENT ? (
          <>
            <p>
              This site shows ads from Google AdSense. Google and its partners may use cookies or similar technologies to serve and measure ads,
              including ads based on your earlier visits to this and other sites. We do not receive or store that information.
            </p>
            <ul>
              <li>
                See how Google uses data from sites that use its services:{" "}
                <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a>.
              </li>
              <li>
                Turn off personalised ads at{" "}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>, or learn about opt-outs at{" "}
                <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
              </li>
              <li>If you are in the European Economic Area, the United Kingdom or Switzerland, a consent message from Google lets you accept or decline ad cookies, and you can change your choice later.</li>
            </ul>
          </>
        ) : (
          <p>This site does not currently show advertising. If that changes, this page will explain how ad cookies work and how to opt out.</p>
        )}

        <h2>Cookies</h2>
        <p>AllRanks itself sets no cookies. Cookies, if any, come from the advertising services described above or from your browser.</p>

        <h2>Links to other sites</h2>
        <p>Rankings link to their original sources. Those sites have their own privacy practices that we do not control.</p>

        <h2>Children</h2>
        <p>The site is general-interest and is not directed at children under 13.</p>

        <h2>Changes and contact</h2>
        <p>
          We will update this page when our practices change and revise the date above.{" "}
          {CONTACT_EMAIL ? <>Questions: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</> : null}
        </p>
      </div>
    </>
  );
}
