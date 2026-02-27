import React from 'react';
import FeaturedCollectionSection from '@/components/home/featured-collection-section';
import { motion } from 'framer-motion';

export const metadata = {
  title: 'Privacy Policy | Nutrazen',
  description: 'Privacy Policy for Nutrazen website.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24">
      {/* Header Banner */}
      <div className="bg-blue-600 text-white py-16 px-4 sm:px-6 lg:px-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">Privacy Policy</h1>
        <p className="text-blue-100 text-lg">Effective Date: 01st Dec 2024</p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-slate-900 shadow-sm rounded-2xl -mt-8 relative z-10 mb-16 border border-slate-100 dark:border-slate-800">
        <div className="prose prose-blue dark:prose-invert max-w-none prose-h2:text-blue-800 prose-h3:text-blue-600 prose-p:text-slate-600 dark:prose-p:text-slate-300">

          <p className="lead text-xl text-slate-700 dark:text-slate-200 mb-8 font-medium">
            Nutrazen (“we,” “our,” or “us”) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this Privacy Policy carefully to understand our views and practices regarding your information and how we will treat it.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">1. Information We Collect</h2>
          <p>We may collect and process the following types of information:</p>

          <h3 className="text-xl font-semibold mt-6 mb-2">a. Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Billing and shipping address</li>
            <li>Payment information (processed securely via third-party payment gateways)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">b. Non-Personal Information</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Time zone setting</li>
            <li>Operating system and platform</li>
            <li>Details about your visit, including the pages you access and interactions with the website</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">c. Health and Wellness Information</h3>
          <p>
            If you provide information regarding your health or wellness as part of a consultation or product recommendation, we may collect such data with your explicit consent.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">2. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>To process and fulfill orders</li>
            <li>To personalize your experience on our website</li>
            <li>To send you updates about your order, new products, or promotions</li>
            <li>To improve our website, products, and services</li>
            <li>To comply with legal obligations or resolve disputes</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">3. Sharing Your Information</h2>
          <p className="mb-4">We do not sell, rent, or trade your personal information. However, we may share your data with:</p>
          <ul className="list-disc pl-6 space-y-4 mb-6">
            <li><strong>Service Providers:</strong> Third parties who help us operate our website, process payments, or deliver products</li>
            <li><strong>Compliance with Laws:</strong> Government authorities if required by law or to protect our legal rights</li>
            <li><strong>Business Transfers:</strong> If Nutrazen undergoes a merger, acquisition, or asset sale, your data may be transferred</li>
          </ul>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">4. Cookies and Tracking Technologies</h2>
          <p>We use cookies to enhance your browsing experience. These may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Session cookies to manage your login sessions</li>
            <li>Analytical cookies to understand how users interact with our website</li>
            <li>Advertising cookies to show relevant ads on other platforms</li>
          </ul>
          <p className="mb-6">You can manage your cookie preferences in your browser settings.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">5. Data Security</h2>
          <p className="mb-6">
            We implement industry-standard security measures to protect your information. While we strive to secure your personal data, no method of transmission over the internet or electronic storage is 100% secure.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access your data and request copies</li>
            <li>Correct inaccuracies in your data</li>
            <li>Request the deletion of your data</li>
            <li>Withdraw consent for data processing (where applicable)</li>
          </ul>
          <p className="mb-6 font-medium">To exercise your rights, contact us at <a href="mailto:info@nutra-zen.com" className="text-blue-600 hover:underline">info@nutra-zen.com</a>.</p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">7. Third-Party Links</h2>
          <p className="mb-6">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites, and we encourage you to review their privacy policies.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">8. Children's Privacy</h2>
          <p className="mb-6">
            Our products and services are not directed to children under 18. We do not knowingly collect personal information from children without verifiable parental consent.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">9. Changes to This Privacy Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated effective date.
          </p>

          <h2 className="text-2xl font-bold mt-10 mb-4 border-b pb-2">10. Contact Us</h2>
          <p className="mb-4">If you have any questions about this Privacy Policy or our practices, please contact us at:</p>

          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 mt-6 shadow-sm">
            <h4 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Nutrazen</h4>
            <address className="not-italic text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <p>Nutrazen Nutraceuticals Private Limited</p>
              <p>Nursing Home-1, Block A1, Tikri,</p>
              <p>Vipul World, Sohna Road,</p>
              <p>Near GD Goenka Public School, Sector 48,</p>
              <p>Gurugram, Haryana, 122018, India</p>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 mt-4">
                <p className="flex items-center gap-2">
                  <span className="font-semibold w-16 text-slate-800 dark:text-slate-200">Email:</span>
                  <a href="mailto:info@nutra-zen.com" className="text-blue-600 hover:underline">info@nutra-zen.com</a>
                </p>
                <p className="flex items-center gap-2 mt-2">
                  <span className="font-semibold w-16 text-slate-800 dark:text-slate-200">Phone:</span>
                  <a href="tel:011-408-48448" className="text-blue-600 hover:underline">011-408-48448</a>
                </p>
              </div>
            </address>
          </div>

        </div>
      </div>

      {/* Featured Collection Component at the end */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <FeaturedCollectionSection />
      </div>
    </main>
  );
}
