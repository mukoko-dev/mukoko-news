import type { Metadata } from "next";
import { getFullUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Mukoko News, the Pan-African digital news aggregation platform by Nyuchi Africa. Read our terms of use, content policies, and user guidelines.",
  alternates: {
    canonical: getFullUrl("/terms"),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-text-secondary mb-8">Last updated: January 2025</p>

      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-text-secondary leading-relaxed">
            By accessing or using Mukoko News, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
          <p className="text-text-secondary leading-relaxed">
            Mukoko News is a Pan-African digital news aggregation platform that collects and displays
            news content from various sources across Africa. We do not create original news content;
            we aggregate and curate articles from third-party publishers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. User Conduct</h2>
          <p className="text-text-secondary leading-relaxed mb-3">You agree not to:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Use the service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the service</li>
            <li>Scrape or collect data without permission</li>
            <li>Impersonate others or provide false information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
          <p className="text-text-secondary leading-relaxed">
            News content displayed on Mukoko News remains the property of its respective publishers.
            The Mukoko News platform, branding, and design are owned by Nyuchi Africa. You may not
            reproduce, distribute, or create derivative works without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Content</h2>
          <p className="text-text-secondary leading-relaxed">
            We aggregate content from third-party sources and are not responsible for the accuracy,
            completeness, or reliability of such content. Views expressed in articles are those of
            the original publishers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Disclaimer of Warranties</h2>
          <p className="text-text-secondary leading-relaxed">
            The service is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee
            uninterrupted or error-free service, and we are not liable for any damages arising from
            your use of the platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
          <p className="text-text-secondary leading-relaxed">
            Nyuchi Africa shall not be liable for any indirect, incidental, special, or consequential
            damages arising from your use of Mukoko News.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">8. Changes to Terms</h2>
          <p className="text-text-secondary leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of the service
            after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">9. Contact</h2>
          <p className="text-text-secondary leading-relaxed">
            For questions about these terms, contact us at{" "}
            <a href="mailto:legal@mukoko.com" className="text-primary hover:underline">
              legal@mukoko.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
