'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Search,
  Book,
  MessageCircle,
  Mail,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Package,
  Route,
  Users,
  Smartphone,
  CreditCard,
  Settings,
  Shield,
} from 'lucide-react';

const categories = [
  {
    icon: Package,
    title: 'Getting Started',
    description: 'New to Movva? Start here.',
    articles: [
      'Creating your account',
      'Setting up your first route',
      'Importing orders via CSV',
      'Inviting team members',
    ],
  },
  {
    icon: Route,
    title: 'Route Optimization',
    description: 'Learn about our AI-powered routing.',
    articles: [
      'How route optimization works',
      'Setting time windows',
      'Vehicle capacity settings',
      'Manual route adjustments',
    ],
  },
  {
    icon: Users,
    title: 'Managing Riders',
    description: 'Add and manage your delivery team.',
    articles: [
      'Adding new riders',
      'Assigning routes to riders',
      'Rider performance tracking',
      'Managing rider schedules',
    ],
  },
  {
    icon: Smartphone,
    title: 'Rider App',
    description: 'Help for the mobile app.',
    articles: [
      'Installing the rider app',
      'Using navigation features',
      'Capturing proof of delivery',
      'Offline mode guide',
    ],
  },
  {
    icon: CreditCard,
    title: 'Billing & Plans',
    description: 'Payments and subscriptions.',
    articles: [
      'Understanding pricing plans',
      'Upgrading your plan',
      'Payment methods',
      'Invoices and receipts',
    ],
  },
  {
    icon: Settings,
    title: 'Account Settings',
    description: 'Customize your experience.',
    articles: [
      'Profile settings',
      'Notification preferences',
      'API key management',
      'Team permissions',
    ],
  },
];

const popularArticles = [
  { title: 'How to import orders from CSV', category: 'Getting Started' },
  { title: 'Understanding route optimization', category: 'Route Optimization' },
  { title: 'Setting up proof of delivery', category: 'Rider App' },
  { title: 'Managing COD reconciliation', category: 'Billing' },
  { title: 'Adding and removing team members', category: 'Account' },
];

const faqs = [
  {
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.',
  },
  {
    question: 'Can I use Movva offline?',
    answer: 'Yes! The rider app works offline. Routes and delivery data sync automatically when connectivity is restored.',
  },
  {
    question: 'How is the optimized route calculated?',
    answer: 'Our AI considers distance, traffic patterns, time windows, vehicle capacity, and delivery priorities to find the most efficient route.',
  },
  {
    question: 'What file formats are supported for order import?',
    answer: 'We support CSV files. You can also use our API for automated imports from your e-commerce or ERP system.',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with Search */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-orange-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-100/50 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-700 mb-6"
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-slate-900 mb-4"
          >
            How can we help?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mb-8"
          >
            Search our knowledge base or browse categories below.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-lg shadow-slate-200/50"
            />
          </motion.div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular articles</h2>
          <div className="flex flex-wrap gap-3">
            {popularArticles.map((article) => (
              <Link
                key={article.title}
                href="#"
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm text-slate-700 transition-colors"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse by category</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-200 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                  <category.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{category.title}</h3>
                <p className="text-sm text-slate-500 mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article}>
                      <Link
                        href="#"
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-slate-300 mb-8">
              Our support team is available to help you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Contact Support
              </Link>
              <Link
                href="mailto:support@movva.io"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
                support@movva.io
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-white">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
