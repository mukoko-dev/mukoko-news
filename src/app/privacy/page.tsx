export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-text-secondary mb-8">Last updated: January 2025</p>

      <div className="prose prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Overview</h2>
          <p className="text-text-secondary leading-relaxed">
            Mukoko News (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your information when you use
            our Pan-African news aggregation platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Information We Collect</h2>

          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Information You Provide</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Country and category preferences for personalization</li>
            <li>Saved articles and reading preferences</li>
            <li>Account information if you create an account</li>
          </ul>

          <h3 className="text-lg font-medium text-foreground mt-4 mb-2">Automatically Collected Information</h3>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Device type and browser information</li>
            <li>Usage patterns and reading history</li>
            <li>General location (country level)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">How We Use Your Information</h2>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Personalize your news feed based on preferences</li>
            <li>Improve our service and user experience</li>
            <li>Analyze usage trends and platform performance</li>
            <li>Send important service updates (if you opt in)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Data Storage</h2>
          <p className="text-text-secondary leading-relaxed">
            Your preferences are stored locally on your device using browser storage. If you create
            an account, your data is securely stored on our servers. We use industry-standard
            encryption and security measures to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Third-Party Services</h2>
          <p className="text-text-secondary leading-relaxed">
            We may use third-party analytics services to understand how our platform is used.
            These services may collect anonymous usage data. We do not sell your personal
            information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Cookies and Local Storage</h2>
          <p className="text-text-secondary leading-relaxed">
            We use cookies and local storage to remember your preferences, theme settings, and
            improve your experience. You can disable cookies in your browser settings, but some
            features may not work properly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Your Rights</h2>
          <p className="text-text-secondary leading-relaxed mb-3">You have the right to:</p>
          <ul className="list-disc list-inside text-text-secondary space-y-2">
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Children&apos;s Privacy</h2>
          <p className="text-text-secondary leading-relaxed">
            Our service is not intended for children under 13. We do not knowingly collect
            information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Changes to This Policy</h2>
          <p className="text-text-secondary leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of significant
            changes by posting a notice on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">Contact Us</h2>
          <p className="text-text-secondary leading-relaxed">
            If you have questions about this privacy policy or your data, contact us at{" "}
            <a href="mailto:privacy@mukoko.com" className="text-primary hover:underline">
              privacy@mukoko.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
