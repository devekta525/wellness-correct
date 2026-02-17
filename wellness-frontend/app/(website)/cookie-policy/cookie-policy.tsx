import React from 'react'

const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
      
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2 className="text-xl font-semibold mb-3">1. What Are Cookies</h2>
          <p>Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling certain functionality.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
          <p>We use cookies to enhance your browsing experience, analyze website traffic, remember your preferences, and provide personalized content. Cookies help us understand how you interact with our website so we can improve our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Types of Cookies We Use</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold">Essential Cookies</h3>
              <p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.</p>
            </div>
            <div>
              <h3 className="font-semibold">Analytics Cookies</h3>
              <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
            </div>
            <div>
              <h3 className="font-semibold">Preference Cookies</h3>
              <p>These cookies remember your choices and preferences to provide you with a more personalized experience.</p>
            </div>
            <div>
              <h3 className="font-semibold">Marketing Cookies</h3>
              <p>These cookies are used to track visitors across websites to display relevant and engaging advertisements.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Third-Party Cookies</h2>
          <p>We may also use third-party cookies from trusted partners to provide additional functionality, such as social media integration, analytics, and advertising services.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Managing Cookies</h2>
          <p>You can control and manage cookies through your browser settings. Most browsers allow you to refuse cookies or delete them. However, disabling cookies may affect the functionality of our website.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookie Consent</h2>
          <p>By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Updates to This Policy</h2>
          <p>We may update this cookie policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at privacy@wellnessfuel.com</p>
        </section>
      </div>
    </div>
  )
}

export default CookiePolicy