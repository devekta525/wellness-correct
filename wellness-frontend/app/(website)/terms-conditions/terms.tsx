import React from 'react'

const Terms = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent italic font-serif">Terms of Service</h1>

            <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-400">Last updated: {new Date().toLocaleDateString()}</p>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
                    <p>By accessing and using Wellness Fuel services, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">2. Use License</h2>
                    <p>Permission is granted to temporarily use Wellness Fuel services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">3. Medical Disclaimer</h2>
                    <p>The information provided on this platform is for general informational purposes only and is not intended as medical advice. Always consult with a qualified healthcare professional for medical concerns.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">4. User Accounts</h2>
                    <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">5. Prohibited Uses</h2>
                    <p>You may not use our services for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">6. Privacy Policy</h2>
                    <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the services, to understand our practices.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">7. Service Availability</h2>
                    <p>We strive to provide continuous service availability, but we do not guarantee that our services will be uninterrupted or error-free. We reserve the right to modify or discontinue services at any time.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">8. Limitation of Liability</h2>
                    <p>In no event shall Wellness Fuel, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">9. Governing Law</h2>
                    <p>These terms shall be interpreted and governed by the laws of the jurisdiction in which Wellness Fuel operates, without regard to its conflict of law provisions.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">10. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. We will notify users of any changes by posting the new terms on this page.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">11. Contact Information</h2>
                    <p>If you have any questions about these Terms of Service, please contact us at <a href="mailto:legal@wellnessfuel.com" className="text-blue-600 hover:underline">legal@wellnessfuel.com</a></p>
                </section>
            </div>
        </div>
    )
}

export default Terms
