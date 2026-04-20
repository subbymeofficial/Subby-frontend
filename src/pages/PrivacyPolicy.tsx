import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <header className="px-6 py-4 max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-foreground">SubbyMe</Link>
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </header>

      <main className="px-6 pb-16">
        <article className="max-w-3xl mx-auto bg-card rounded-2xl border shadow-sm p-6 md:p-10 space-y-6 text-foreground">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              SubbyMe Platform &middot; Last updated: April 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is
              committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your personal information when
              you use our platform, including the website at subbyme.com.au,
              subbyme.com, and the SubbyMe mobile application (the
              &ldquo;Service&rdquo;).
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We comply with the Australian Privacy Principles (APPs) under the
              Privacy Act 1988 (Cth) and, for US users, applicable US privacy laws
              including the California Consumer Privacy Act (CCPA) where relevant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Information We Collect</h2>

            <h3 className="text-base font-semibold">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Account information: name, email address, phone number, business name, ABN (Australia) or EIN (US).</li>
              <li>Profile information: trade type, licence numbers, service areas, photos, business description.</li>
              <li>Availability data: calendar entries showing your available and unavailable days.</li>
              <li>Payment information: billing details processed securely by Stripe (we do not store card numbers).</li>
              <li>Communications: messages, support requests, and feedback you send us.</li>
            </ul>

            <h3 className="text-base font-semibold">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Device information: device type, operating system, browser type, unique device identifiers.</li>
              <li>Usage data: pages visited, features used, search queries, interaction patterns.</li>
              <li>Location data: approximate location derived from IP address; precise location only with your consent.</li>
              <li>Cookies and similar technologies: as described in Section 8.</li>
            </ul>

            <h3 className="text-base font-semibold">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Licence verification data from public government registers.</li>
              <li>Payment processing data from Stripe.</li>
              <li>Analytics data from Google Analytics and similar services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use your personal information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Providing the Service: creating and managing accounts, displaying profiles, processing payments.</li>
              <li>Matching: connecting Contractors with Clients based on availability, trade, and location.</li>
              <li>Communication: sending service-related notifications, updates, and marketing (with consent).</li>
              <li>Verification: verifying trade licences and qualifications.</li>
              <li>Improvement: analysing usage to improve the Service, fix bugs, and develop new features.</li>
              <li>Safety and compliance: detecting fraud, enforcing our Terms, and complying with legal obligations.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. How We Share Your Information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We do not sell your personal information. We may share your information
              in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>With other users: your profile, availability, and trade information are visible to other Platform users. This is the core function of the Service.</li>
              <li>Service providers: we share information with trusted third-party service providers who help us operate the Service, including Stripe (payments), Supabase (hosting), and analytics providers.</li>
              <li>Legal requirements: we may disclose information if required by law, court order, or government request.</li>
              <li>Business transfers: in connection with a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</li>
              <li>With your consent: we may share information for purposes you have explicitly agreed to.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Data Retention</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We retain your personal information for as long as your account is
              active or as needed to provide the Service. After account deletion, we
              retain certain data as required by law (for example, financial records
              for 7 years under Australian tax law). We will delete or de-identify
              personal information when it is no longer needed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Data Security</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We implement reasonable technical and organisational measures to protect
              your personal information, including encryption in transit (TLS), secure
              cloud hosting, access controls, and regular security reviews. However,
              no method of transmission over the internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">7. Your Rights</h2>

            <h3 className="text-base font-semibold">7.1 Australian Users</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Under the Privacy Act 1988, you have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Complain to the Office of the Australian Information Commissioner (OAIC) if you believe we have breached the APPs.</li>
            </ul>

            <h3 className="text-base font-semibold">7.2 US Users</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Depending on your state of residence, you may have additional rights
              including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Right to know what personal information we collect and how it is used.</li>
              <li>Right to delete your personal information.</li>
              <li>Right to opt out of the sale of personal information (we do not sell personal information).</li>
              <li>Right to non-discrimination for exercising your privacy rights.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@subbyme.com.au"
                className="text-primary hover:underline"
              >
                privacy@subbyme.com.au
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">8. Cookies</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use cookies and similar tracking technologies to operate and improve
              the Service. These include:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Essential cookies: required for the Service to function (authentication, session management).</li>
              <li>Analytics cookies: help us understand how you use the Service (Google Analytics).</li>
              <li>Preference cookies: remember your settings and preferences.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You can control cookies through your browser settings. Disabling
              essential cookies may prevent you from using certain features of the
              Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">9. International Data Transfers</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your information may be transferred to and processed in countries other
              than your country of residence, including Australia and the United
              States. We ensure that any such transfers comply with applicable data
              protection laws and that appropriate safeguards are in place.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">10. Children&rsquo;s Privacy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Service is not directed to individuals under 18 years of age. We do
              not knowingly collect personal information from children. If we become
              aware that we have collected personal information from a child under 18,
              we will take steps to delete that information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">11. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you
              of material changes by posting the updated policy on the Platform and,
              where appropriate, by email. The &ldquo;Last Updated&rdquo; date at the
              top indicates when the policy was last revised.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">12. Contact Us</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have questions or concerns about this Privacy Policy or our data
              practices, please contact us:
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Email:{" "}
              <a
                href="mailto:privacy@subbyme.com.au"
                className="text-primary hover:underline"
              >
                privacy@subbyme.com.au
              </a>
              <br />
              Post: SubbyMe, 502 Christmas Creek Road, Tabooba QLD 4285, Australia
              <br />
              Phone: +61 421 911 310
            </p>
          </section>
        </article>

        <p className="max-w-3xl mx-auto text-center text-xs text-muted-foreground mt-8">
          See also our{" "}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
