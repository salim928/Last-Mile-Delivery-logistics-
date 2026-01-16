'use client';

import Link from 'next/link';
import { Truck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 lg:px-10 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-500 mb-12">Last updated: January 1, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Movva Technologies Ltd. (&quot;Movva,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
              our logistics optimization platform and services.
            </p>
            <p className="text-slate-600 leading-relaxed">
              By using Movva, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Account information (name, email, phone number, company name)</li>
              <li>Order data (customer names, addresses, delivery details)</li>
              <li>Rider information (names, phone numbers, vehicle details)</li>
              <li>Payment and billing information</li>
              <li>Communications with our support team</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Device information (browser type, operating system, device type)</li>
              <li>Usage data (features used, pages visited, actions taken)</li>
              <li>Location data (GPS coordinates from rider mobile app, with consent)</li>
              <li>Log data (IP addresses, timestamps, error logs)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To optimize delivery routes using our algorithms</li>
              <li>To enable real-time tracking and notifications</li>
              <li>To process payments and manage subscriptions</li>
              <li>To improve our platform and develop new features</li>
              <li>To communicate with you about updates and support</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Information Sharing</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li><strong>Service providers:</strong> Cloud hosting, payment processors, SMS providers</li>
              <li><strong>Business partners:</strong> Integration partners you choose to connect</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Security</h2>
            <p className="text-slate-600 leading-relaxed">
              We implement industry-standard security measures including encryption in transit and at rest, 
              access controls, regular security audits, and secure data centers. However, no method of 
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services. 
              You may request deletion of your data at any time, subject to legal retention requirements.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of marketing communications</li>
              <li>Disable location tracking in the rider app</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 p-6 bg-slate-50 rounded-xl">
              <p className="text-slate-700">
                <strong>Movva Technologies Ltd.</strong><br />
                15 Independence Avenue, Airport City<br />
                Accra, Ghana<br />
                Email: privacy@movva.io<br />
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
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900">Terms of Service</Link>
              <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
