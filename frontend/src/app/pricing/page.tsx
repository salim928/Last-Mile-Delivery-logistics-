'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  ArrowRight,
  Zap,
  Building2,
  Rocket,
  Crown,
  HelpCircle,
  ChevronDown,
  Truck,
} from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses getting started with delivery optimization.',
    price: { monthly: 99, annually: 79 },
    currency: '₵',
    icon: Rocket,
    gradient: 'from-blue-500 to-cyan-500',
    popular: false,
    features: [
      { name: 'Up to 500 orders/month', included: true },
      { name: '3 riders', included: true },
      { name: 'Basic route optimization', included: true },
      { name: 'GPS tracking', included: true },
      { name: 'Email support', included: true },
      { name: 'CSV import', included: true },
      { name: 'API access', included: false },
      { name: 'Custom integrations', included: false },
      { name: 'Priority support', included: false },
      { name: 'Dedicated account manager', included: false },
    ],
  },
  {
    name: 'Professional',
    description: 'For growing businesses that need more power and flexibility.',
    price: { monthly: 299, annually: 249 },
    currency: '₵',
    icon: Building2,
    gradient: 'from-amber-500 to-orange-500',
    popular: true,
    features: [
      { name: 'Up to 5,000 orders/month', included: true },
      { name: '15 riders', included: true },
      { name: 'Advanced AI optimization', included: true },
      { name: 'Real-time GPS tracking', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'CSV & API import', included: true },
      { name: 'Full API access', included: true },
      { name: 'Zapier integration', included: true },
      { name: 'COD reconciliation', included: true },
      { name: 'Dedicated account manager', included: false },
    ],
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for large-scale logistics operations.',
    price: { monthly: null, annually: null },
    currency: '₵',
    icon: Crown,
    gradient: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      { name: 'Unlimited orders', included: true },
      { name: 'Unlimited riders', included: true },
      { name: 'Enterprise AI optimization', included: true },
      { name: 'Advanced analytics & BI', included: true },
      { name: '24/7 phone & priority support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'White-label options', included: true },
      { name: 'On-premise deployment', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'Dedicated account manager', included: true },
    ],
  },
];

const faqs = [
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers for annual plans. Enterprise customers can also pay via invoice.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All plans come with a 14-day free trial. No credit card required to start. You\'ll have full access to all features during the trial period.',
  },
  {
    question: 'What happens if I exceed my order limit?',
    answer: 'We\'ll notify you when you reach 80% of your limit. You can upgrade your plan or purchase additional orders at ₵0.50 per order for Starter and ₵0.30 for Professional.',
  },
  {
    question: 'Do you offer discounts for NGOs?',
    answer: 'Yes! We offer 30% off for registered non-profits and NGOs. Contact our sales team with your registration documents to apply.',
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee for annual plans. Monthly plans can be cancelled anytime with no further charges.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 mb-6"
          >
            <Zap className="w-4 h-4" />
            Save 20% with annual billing
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1]"
          >
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              pricing
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Choose the plan that fits your delivery volume. All plans include a 14-day 
            free trial with no credit card required.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 p-1.5 bg-slate-100 rounded-full"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'annually'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annually
              <span className="ml-2 text-xs text-emerald-600 font-semibold">-20%</span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-3xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-slate-900 to-slate-800 text-white scale-105 shadow-2xl shadow-slate-900/20'
                    : 'bg-white border border-slate-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/10 transition-all'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wide shadow-lg shadow-orange-500/25">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6`}>
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price.monthly ? (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                            {plan.currency}{billingCycle === 'monthly' ? plan.price.monthly : plan.price.annually}
                          </span>
                          <span className={plan.popular ? 'text-slate-400' : 'text-slate-500'}>/month</span>
                        </div>
                        {billingCycle === 'annually' && (
                          <p className={`text-sm mt-1 ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>
                            Billed annually ({plan.currency}{plan.price.annually * 12}/year)
                          </p>
                        )}
                      </>
                    ) : (
                      <div className={`text-3xl font-bold ${plan.popular ? 'text-white' : 'text-slate-900'}`}>
                        Custom
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={plan.price.monthly ? '/register' : '/contact'}
                    className={`block w-full py-3.5 rounded-full text-center font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.price.monthly ? 'Start free trial' : 'Contact sales'}
                  </Link>

                  {/* Features */}
                  <div className={`mt-8 pt-8 border-t ${plan.popular ? 'border-slate-700' : 'border-slate-200'}`}>
                    <p className={`text-sm font-semibold mb-4 ${plan.popular ? 'text-slate-300' : 'text-slate-700'}`}>
                      What&apos;s included:
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature.name} className="flex items-start gap-3">
                          {feature.included ? (
                            <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-orange-400' : 'text-emerald-500'}`} />
                          ) : (
                            <X className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-slate-600' : 'text-slate-300'}`} />
                          )}
                          <span className={`text-sm ${
                            feature.included
                              ? plan.popular ? 'text-slate-200' : 'text-slate-700'
                              : plan.popular ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Compare all features
            </h2>
            <p className="text-lg text-slate-600">
              Detailed breakdown of what you get with each plan.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-6 font-semibold text-slate-900">Feature</th>
                    <th className="p-6 text-center font-semibold text-slate-900">Starter</th>
                    <th className="p-6 text-center font-semibold text-slate-900 bg-orange-50">Professional</th>
                    <th className="p-6 text-center font-semibold text-slate-900">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Monthly orders', starter: '500', pro: '5,000', enterprise: 'Unlimited' },
                    { feature: 'Riders', starter: '3', pro: '15', enterprise: 'Unlimited' },
                    { feature: 'Route optimization', starter: 'Basic', pro: 'Advanced AI', enterprise: 'Enterprise AI' },
                    { feature: 'GPS tracking', starter: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'POD capture', starter: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'API access', starter: '—', pro: '✓', enterprise: '✓' },
                    { feature: 'Integrations', starter: '—', pro: 'Zapier', enterprise: 'Custom' },
                    { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom BI' },
                    { feature: 'Support', starter: 'Email', pro: 'Priority', enterprise: '24/7 Phone' },
                    { feature: 'SLA', starter: '—', pro: '—', enterprise: '99.9%' },
                  ].map((row, i) => (
                    <tr key={row.feature} className={i % 2 === 0 ? 'bg-slate-50/50' : ''}>
                      <td className="p-6 text-sm text-slate-700">{row.feature}</td>
                      <td className="p-6 text-center text-sm text-slate-600">{row.starter}</td>
                      <td className="p-6 text-center text-sm text-slate-900 bg-orange-50/50 font-medium">{row.pro}</td>
                      <td className="p-6 text-center text-sm text-slate-600">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about pricing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-slate-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {openFaq === index && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 text-slate-600 leading-relaxed"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Start free trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
