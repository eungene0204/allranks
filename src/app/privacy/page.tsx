import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = pageMetadata('Privacy Policy', 'AllRanks privacy policy, Google Analytics, and advertising cookies.', '/privacy');

export default function PrivacyPage() {
  return (
    <>
      <div className="page-head">
        <h1>Privacy Policy</h1>
        <p>Last updated: October 23, 2026</p>
      </div>
      <div className="prose">
        <h2>What we collect</h2>
        <p>
          AllRanks has no accounts, no sign-in and no forms that ask for personal information. We do not store personal data about
          visitors. When Google Analytics is enabled, Google receives usage information such as pages viewed, interaction events, approximate location, device and browser details, and identifiers stored in cookies or similar technologies. Analytics is used to understand site usage and improve AllRanks.
        </p>
        <p>Google Analytics is provided by Google. You can limit cookies through your browser settings or use Google&apos;s Analytics opt-out browser add-on. Google may process information on servers outside your country; see Google&apos;s privacy documentation for its practices.</p>
        <p>
          Like any website, the server that delivers pages may keep standard technical logs (such as IP address, requested page and time) for security and
          operation. This includes the text of a search if you use the search page, because it is part of the page address. We do not use these logs to identify you.
        </p>

        <h2>Advertising</h2>
        <p>Advertising is currently paused. AllRanks does not load the Google AdSense advertising script or request ads. A public publisher identifier is included for site ownership verification; this identifier does not itself serve ads.</p>
        <p>If advertising is enabled later, we will update this policy to describe the advertising services, cookies and consent choices before serving ads.</p>

        <h2>Cookies</h2>
        <p>When Google Analytics is enabled, Google Analytics may use cookies and similar technologies to distinguish visits and measure usage. AllRanks does not currently serve advertising or set advertising cookies. Your browser or external sites you visit through links may manage their own cookies.</p>

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
