'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-500 mb-12">Last updated: January 1, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using Movva&apos;s logistics optimization platform (&quot;Service&quot;), you agree to be 
              bound by these Terms of Service. If you disagree with any part of the terms, you may not 
              access the Service. These Terms apply to all visitors, users, and others who access or use 
              the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Movva provides a last-mile logistics optimization platform that includes:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Route optimization algorithms</li>
              <li>Real-time delivery tracking</li>
              <li>Proof of delivery capture</li>
              <li>Fleet management tools</li>
              <li>Analytics and reporting</li>
              <li>API access for integrations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.1 Account Creation</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              You must provide accurate and complete information when creating an account. You are 
              responsible for safeguarding your account credentials and for all activities under your account.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">3.2 Account Types</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Merchant accounts:</strong> For businesses managing deliveries</li>
              <li><strong>Rider accounts:</strong> For delivery personnel using the mobile app</li>
              <li><strong>Admin accounts:</strong> For platform administrators</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit malicious code or interfere with the Service</li>
              <li>Attempt to gain unauthorized access to any systems</li>
              <li>Use the Service to transport illegal goods</li>
              <li>Falsify delivery records or proof of delivery</li>
              <li>Share account credentials with unauthorized parties</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Pricing and Payment</h2>
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.1 Subscription Plans</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We offer various subscription plans with different features and limits. Pricing is 
              displayed on our website and may change with 30 days notice.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.2 Billing</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Subscriptions are billed monthly or annually in advance. All fees are non-refundable 
              except as required by law or as explicitly stated.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">5.3 Taxes</h3>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for any applicable taxes based on your location.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The Service and its original content, features, and functionality are owned by Movva 
              Technologies Ltd. and are protected by copyright, trademark, and other intellectual 
              property laws.
            </p>
            <p className="text-slate-600 leading-relaxed">
              You retain ownership of data you upload to the Service but grant us a license to use 
              it to provide and improve our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Termination</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We may terminate or suspend your account immediately, without prior notice, for conduct 
              that we believe violates these Terms or is harmful to other users, us, or third parties, 
              or for any other reason.
            </p>
            <p className="text-slate-600 leading-relaxed">
              You may terminate your account at any time by contacting us. Upon termination, your 
              right to use the Service will cease immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              In no event shall Movva Technologies Ltd., its directors, employees, partners, agents, 
              suppliers, or affiliates be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your access to or use of or inability to 
              access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Disclaimer</h2>
            <p className="text-slate-600 leading-relaxed">
              Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; 
              and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, 
              whether express or implied, including, but not limited to, implied warranties of 
              merchantability, fitness for a particular purpose, non-infringement, or course of performance.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of Ghana, 
              without regard to its conflict of law provisions. Any disputes arising under these 
              Terms shall be subject to the exclusive jurisdiction of the courts of Ghana.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. We will provide 
              notice of any changes by posting the new Terms on this page and updating the 
              &quot;Last updated&quot; date. Your continued use of the Service after any changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="mt-4 p-6 bg-slate-50 rounded-xl">
              <p className="text-slate-700">
                <strong>Movva Technologies Ltd.</strong><br />
                15 Independence Avenue, Airport City<br />
                Accra, Ghana<br />
                Email: legal@movva.io<br />
                Phone: +233 30 274 5678
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">Privacy Policy</Link>
              <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
