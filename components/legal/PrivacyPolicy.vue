<template>
  <!--  eslint-disable-next-line tailwindcss/no-custom-classname-->
  <div class="html-content">
    <h2 id="privacy-policy-for-recipebase-co">Privacy Policy</h2>
    <p><strong>Effective Date</strong>: January 28, 2024</p>
    <p>
      Recipebase.co (“we,” “our,” or “us”) respects your privacy and is
      committed to protecting your personal data. This Privacy Policy explains
      how we collect, use, and safeguard your information when you use our SaaS
      platform (“Service”). By using Recipebase.co, you agree to the terms of
      this policy.
    </p>
    <h3 id="1-information-we-collect">1. Information We Collect</h3>
    <p>
      We collect the following types of personal data to provide and improve our
      services:
    </p>
    <ul>
      <li>
        <strong>Personal Identifiable Information</strong>: Your name and email
        address, which may be collected through OAuth or during account
        creation.
      </li>
      <li>
        <strong>Cookies and Tracking Data</strong>: Information collected
        automatically when you use our Service, including session data and
        analytics data.
      </li>
    </ul>
    <h4 id="-analytics-data-">Analytics Data</h4>
    <p>
      We use <strong>Umami Analytics</strong>, a privacy-focused, cookie-free
      analytics tool, to collect the following information:
    </p>
    <ul>
      <li>Pages visited and the time spent on each page.</li>
      <li>Referrer URLs (the website you came from).</li>
      <li>Your browser, device, and operating system type.</li>
      <li>Geographic region (based on anonymized IP data).</li>
    </ul>
    <p>
      Umami does not track you across different websites and does not collect
      personally identifiable information.
    </p>
    <h3 id="2-how-we-collect-data">2. How We Collect Data</h3>
    <p>We collect personal data in two ways:</p>
    <ol>
      <li>
        <strong>Directly from You</strong>: When you create an account, interact
        with our platform, or provide information during the use of application
        features.
      </li>
      <li>
        <strong>Automatically</strong>: Through Umami Analytics and other
        tracking technologies that operate without cookies.
      </li>
    </ol>
    <h3 id="3-how-we-use-your-information">3. How We Use Your Information</h3>
    <p>We use the collected data for:</p>
    <ul>
      <li>Account creation and management.</li>
      <li>Providing application features to improve user experience.</li>
      <li>
        Understanding how users interact with the platform to optimize its
        performance and design (via Umami Analytics).
      </li>
    </ul>
    <h3 id="4-data-sharing-and-hosting">4. Data Sharing and Hosting</h3>
    <p>
      Your data is hosted and processed securely by our third-party service
      provider, <strong>Supabase</strong>, which ensures encryption and
      industry-standard security practices to safeguard your personal
      information.
    </p>
    <p>
      We use <strong>Umami Analytics</strong> to analyze how users interact with
      our Service. All analytics data is anonymized and aggregated, meaning it
      cannot be used to identify you personally. No data is shared with third
      parties through Umami.
    </p>
    <p>
      We do not share your personal information with other third parties without
      your explicit consent unless required by law.
    </p>
    <h3 id="5-data-retention-and-deletion">5. Data Retention and Deletion</h3>
    <ul>
      <li>
        <strong>Retention</strong>: Your personal data is retained as long as
        your account remains active.
      </li>
      <li>
        <strong>Deletion</strong>: You can delete your account and personal data
        at any time through your account settings.
      </li>
    </ul>
    <h3 id="6-your-rights">6. Your Rights</h3>
    <p>As a user of Recipebase.co, you have the following rights:</p>
    <ul>
      <li>
        <strong>Access</strong>: You can download your personal data from your
        account.
      </li>
      <li>
        <strong>Deletion</strong>: You can permanently delete your account and
        associated data at any time.
      </li>
    </ul>
    <p>
      If you wish to exercise your rights or have any questions about your data,
      contact us at <strong>contact@recipebase.co</strong>.
    </p>
    <h3 id="7-cookies-and-tracking-technologies">
      7. Cookies and Tracking Technologies
    </h3>
    <p>We use cookies and tracking technologies to:</p>
    <ul>
      <li>Maintain sessions.</li>
      <li>
        Analyze how users interact with the platform to improve functionality.
      </li>
    </ul>
    <h4 id="-umami-analytics-">Umami Analytics</h4>
    <p>
      Umami Analytics is a privacy-focused, cookie-free tool. It does not use
      cookies, store IP addresses, or track users across websites. This ensures
      compliance with GDPR, CCPA, and other privacy regulations while still
      providing us with essential insights to improve our platform.
    </p>
    <p>
      By using Recipebase.co, you consent to the data collection practices
      outlined here. You can manage your browser settings to restrict certain
      tracking features, but this may impact the platform&#39;s performance.
    </p>
    <h3 id="8-data-security">8. Data Security</h3>
    <p>
      We take data security seriously and employ the following measures to
      protect your information:
    </p>
    <ul>
      <li>
        <strong>Encryption</strong>: All data hosted by Supabase is encrypted to
        prevent unauthorized access.
      </li>
      <li>
        <strong>Access Controls</strong>: Only authorized personnel can access
        your data.
      </li>
    </ul>
    <h3 id="9-updates-to-this-privacy-policy">
      9. Updates to This Privacy Policy
    </h3>
    <p>
      We may update this Privacy Policy periodically to reflect changes in our
      practices or legal requirements. Users will be notified of changes by
      email. We encourage you to review this page regularly to stay informed.
    </p>
    <h3 id="10-contact-us">10. Contact Us</h3>
    <p>
      If you have any questions or concerns about this Privacy Policy, please
      contact us at:
    </p>
    <ul>
      <li><strong>Email</strong>: contact@recipebase.co</li>
    </ul>
  </div>
</template>

<style scoped>
@reference "../../assets/css/tailwind.css"

@layer base {
  .html-content {
    p {
      @apply text-sm leading-7 [&:not(:first-child)]:mt-6;
    }
    li {
      @apply text-sm;
    }
    ul {
      @apply my-6 ml-6 list-disc [&>li]:mt-2;
    }
    h2 {
      @apply mt-10 scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0;
    }
    h3 {
      @apply mt-8 scroll-m-20 text-2xl font-semibold tracking-tight;
    }
    h4 {
      @apply scroll-m-20 text-xl font-semibold tracking-tight;
    }
  }
}
</style>
