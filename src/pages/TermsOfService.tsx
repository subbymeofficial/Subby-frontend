import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              SubbyMe Platform &middot; Last updated: April 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">1. Agreement to Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing or using the SubbyMe platform (the &ldquo;Platform&rdquo;),
              including the website at subbyme.com.au, subbyme.com, and the SubbyMe
              mobile application (collectively, the &ldquo;Service&rdquo;), you agree
              to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do
              not agree to these Terms, you must not access or use the Service.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The Service is operated by Forester Holdings (ABN pending)
              (&ldquo;SubbyMe&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
              &ldquo;our&rdquo;), with its principal place of business at 502
              Christmas Creek Road, Tabooba QLD 4285, Australia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">2. Eligibility</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You must be at least 18 years of age to use the Service. By using the
              Service, you represent and warrant that you are at least 18 years old
              and have the legal capacity to enter into a binding agreement.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you are using the Service on behalf of a business entity, you
              represent and warrant that you have the authority to bind that entity
              to these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">3. Description of Service</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe is a calendar-first availability directory that connects
              subcontractors (&ldquo;Tradies&rdquo; or &ldquo;Contractors&rdquo;) with
              builders, general contractors, and other parties seeking their services
              (&ldquo;Clients&rdquo;). The Platform allows Contractors to display
              their availability, trade qualifications, and contact information, and
              allows Clients to search and connect with available Contractors.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe is a directory and connection platform only. We do not employ
              Contractors, guarantee the quality of any work performed, or serve as a
              party to any agreement between Contractors and Clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">4. Account Registration</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To access certain features of the Service, you must register for an
              account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Maintain and update your information to keep it accurate and current.</li>
              <li>Maintain the security of your password and account credentials.</li>
              <li>Accept responsibility for all activities that occur under your account.</li>
              <li>Notify us immediately of any unauthorised use of your account.</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to suspend or terminate accounts that contain
              inaccurate information or violate these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">5. Contractor Accounts</h2>

            <h3 className="text-base font-semibold">5.1 Profile and Verification</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Contractors must provide a valid trade licence or equivalent
              qualification where required by applicable state or territory law.
              SubbyMe may verify licence information against public registers.
              Providing false or misleading licence information is grounds for
              immediate account termination.
            </p>

            <h3 className="text-base font-semibold">5.2 Availability Calendar</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Contractors are responsible for keeping their availability calendar
              accurate and up to date. SubbyMe is not responsible for any
              consequences arising from inaccurate availability information.
            </p>

            <h3 className="text-base font-semibold">5.3 Conduct</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Contractors agree to conduct themselves professionally in all
              interactions facilitated through the Platform. This includes responding
              to enquiries in a timely manner and honouring commitments made through
              the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">6. Subscriptions and Payments</h2>

            <h3 className="text-base font-semibold">6.1 Subscription Plans</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe offers paid subscription plans for Contractors. Current plans
              and pricing are displayed on the Platform and may be updated from time
              to time. All prices are in Australian Dollars (AUD) for Australian users
              and US Dollars (USD) for United States users, and are billed weekly via
              Stripe.
            </p>

            <h3 className="text-base font-semibold">6.2 Free Trial</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              New Contractor accounts may be eligible for a free trial period as
              advertised on the Platform. At the end of the free trial, your
              subscription will automatically convert to a paid subscription unless
              you cancel before the trial expires.
            </p>

            <h3 className="text-base font-semibold">6.3 Billing</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Subscription fees are billed weekly in advance. By subscribing, you
              authorise SubbyMe (via our payment processor, Stripe) to charge your
              nominated payment method on a recurring weekly basis.
            </p>

            <h3 className="text-base font-semibold">6.4 Cancellation</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You may cancel your subscription at any time through your account
              settings. Cancellation takes effect at the end of the current billing
              period. No refunds are provided for partial billing periods.
            </p>

            <h3 className="text-base font-semibold">6.5 Price Changes</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may change subscription prices at any time. We will provide at least
              30 days&rsquo; notice of any price increase via email. Continued use of
              the Service after a price change constitutes acceptance of the new
              price.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">7. Client Accounts</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Clients may browse Contractor profiles and availability for free.
              Additional features may require registration. Clients agree not to use
              information obtained through the Platform for spam, harassment, or any
              purpose other than engaging Contractors for legitimate work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">8. Prohibited Conduct</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Use the Service for any unlawful purpose or in violation of any applicable law.</li>
              <li>Post false, misleading, or fraudulent information.</li>
              <li>Harass, abuse, or threaten other users.</li>
              <li>Attempt to circumvent the Platform to avoid paying subscription fees.</li>
              <li>Scrape, data-mine, or use automated tools to extract data from the Service.</li>
              <li>Interfere with the operation of the Service or attempt to gain unauthorised access.</li>
              <li>Impersonate any person or entity.</li>
              <li>Use the Service to advertise or promote unrelated products or services.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">9. Intellectual Property</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All content, features, and functionality of the Service (including but
              not limited to text, graphics, logos, icons, images, software, and the
              SubbyMe brand) are the exclusive property of SubbyMe and are protected
              by Australian and international copyright, trademark, and other
              intellectual property laws.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You retain ownership of content you submit to the Platform (such as
              profile information and photos). By submitting content, you grant
              SubbyMe a worldwide, non-exclusive, royalty-free licence to use,
              display, and distribute that content in connection with the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">10. Disclaimers</h2>
            <p className="text-sm leading-relaxed text-muted-foreground uppercase">
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. To the maximum extent permitted by law, SubbyMe
              disclaims all warranties, whether express, implied, or statutory,
              including warranties of merchantability, fitness for a particular
              purpose, and non-infringement.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe does not warrant that:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>The Service will be uninterrupted, secure, or error-free.</li>
              <li>Any Contractor listed on the Platform is qualified, licenced, or competent.</li>
              <li>Any work performed by a Contractor will be satisfactory.</li>
              <li>The information on the Platform is accurate, complete, or current.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">11. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground uppercase">
              To the maximum extent permitted by applicable law, SubbyMe shall not be
              liable for any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data, revenue, or
              reputation, arising out of or related to your use of the Service.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SubbyMe&rsquo;s total liability for any claim arising out of or relating
              to these Terms or the Service shall not exceed the amount you paid to
              SubbyMe in the 12 months preceding the claim.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nothing in these Terms excludes or limits liability that cannot be
              excluded or limited under applicable law, including the Australian
              Consumer Law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">12. Indemnification</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree to indemnify, defend, and hold harmless SubbyMe, its officers,
              directors, employees, and agents from any claims, damages, losses, and
              expenses (including reasonable legal fees) arising out of or related to
              your use of the Service, your violation of these Terms, or your
              violation of any rights of a third party.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">13. Termination</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may suspend or terminate your account at any time, with or without
              cause, and with or without notice. Upon termination, your right to use
              the Service ceases immediately. Provisions that by their nature should
              survive termination (including ownership, disclaimers, indemnification,
              and limitations of liability) shall survive.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">14. Governing Law</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              These Terms are governed by and construed in accordance with the laws of
              Queensland, Australia. For users in the United States, any disputes
              shall be resolved in accordance with the laws of the State of Texas to
              the extent required by applicable law. You agree to submit to the
              non-exclusive jurisdiction of the courts of Queensland, Australia for
              the resolution of any disputes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">15. Changes to Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We may update these Terms from time to time. We will notify you of
              material changes by posting the updated Terms on the Platform and
              updating the &ldquo;Last Updated&rdquo; date. Your continued use of the
              Service after any changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold">16. Contact</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Email:{" "}
              <a
                href="mailto:support@subbyme.com.au"
                className="text-primary hover:underline"
              >
                support@subbyme.com.au
              </a>
              <br />
              Post: SubbyMe, 502 Christmas Creek Road, Tabooba QLD 4285, Australia
            </p>
          </section>
        </article>

        <p className="max-w-3xl mx-auto text-center text-xs text-muted-foreground mt-8">
          See also our{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
