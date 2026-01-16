'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Route, 
  MapPin, 
  Package, 
  Users, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap,
  Globe,
  Clock,
  Wallet,
  Camera,
  Bell,
  ArrowRight,
  CheckCircle2,
  Play,
  ChevronRight
} from 'lucide-react';

const featureCategories = [
  { id: 'optimization', label: 'Route Optimization' },
  { id: 'tracking', label: 'Live Tracking' },
  { id: 'management', label: 'Fleet Management' },
  { id: 'analytics', label: 'Analytics' },
];

const features = {
  optimization: [
    {
      icon: Route,
      title: 'AI-Powered Route Planning',
      description: 'Our algorithms analyze traffic patterns, delivery windows, and vehicle capacity to create the most efficient routes.',
      benefits: ['Save 30% on fuel costs', 'Reduce delivery time by 25%', 'Handle 100+ stops per route'],
    },
    {
      icon: Clock,
      title: 'Time Window Optimization',
      description: 'Schedule deliveries within specific time windows while maintaining route efficiency.',
      benefits: ['Customer time preferences', 'Business hour constraints', 'Priority handling'],
    },
    {
      icon: Zap,
      title: 'Dynamic Re-routing',
      description: 'Automatically adjust routes in real-time based on traffic, delays, or new orders.',
      benefits: ['Real-time traffic updates', 'Weather-aware routing', 'Instant recalculation'],
    },
  ],
  tracking: [
    {
      icon: MapPin,
      title: 'Real-Time GPS Tracking',
      description: 'Track every vehicle and delivery in real-time with precise GPS location updates.',
      benefits: ['Live location updates', 'Historical route playback', 'Geofencing alerts'],
    },
    {
      icon: Bell,
      title: 'Customer Notifications',
      description: 'Keep customers informed with automated SMS and WhatsApp delivery updates.',
      benefits: ['Automated ETA updates', 'Delivery confirmations', 'Multi-channel support'],
    },
    {
      icon: Globe,
      title: 'Customer Tracking Portal',
      description: 'Give customers a branded tracking page to follow their deliveries.',
      benefits: ['Branded experience', 'Live map view', 'Rating & feedback'],
    },
  ],
  management: [
    {
      icon: Users,
      title: 'Rider Management',
      description: 'Manage your entire fleet from one dashboard. Assign routes, track performance, and handle payroll.',
      benefits: ['Performance metrics', 'Shift scheduling', 'Document management'],
    },
    {
      icon: Smartphone,
      title: 'Rider Mobile App',
      description: 'Purpose-built mobile app for riders with offline support and easy navigation.',
      benefits: ['Turn-by-turn navigation', 'Offline functionality', 'One-tap status updates'],
    },
    {
      icon: Camera,
      title: 'Proof of Delivery',
      description: 'Capture signatures, photos, and notes as proof of delivery completion.',
      benefits: ['Photo capture', 'Digital signatures', 'Delivery notes'],
    },
  ],
  analytics: [
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Comprehensive dashboards showing delivery performance, costs, and trends.',
      benefits: ['Cost analysis', 'Delivery success rates', 'Custom reports'],
    },
    {
      icon: Wallet,
      title: 'COD Reconciliation',
      description: 'Track cash-on-delivery collections and reconcile with rider remittances.',
      benefits: ['Real-time tracking', 'Automated reconciliation', 'Discrepancy alerts'],
    },
    {
      icon: Shield,
      title: 'Savings Reports',
      description: 'See exactly how much you\'re saving with optimized routes and operations.',
      benefits: ['Fuel savings', 'Time savings', 'Cost comparisons'],
    },
  ],
};

const integrations = [
  { name: 'Shopify', logo: '🛒' },
  { name: 'WooCommerce', logo: '🔌' },
  { name: 'Jumia', logo: '📦' },
  { name: 'API', logo: '⚡' },
  { name: 'WhatsApp', logo: '💬' },
  { name: 'Google Maps', logo: '🗺️' },
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('optimization');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Pricing
              </Link>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign In
              </Link>
              <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-orange-50/50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-100/50 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full mb-6 border border-orange-200">
                <Zap className="w-4 h-4" />
                Powerful Features
              </span>
              <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                Everything you need to <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">optimize deliveries</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Movva combines AI-powered route optimization, real-time tracking, and powerful analytics 
                to transform your last-mile delivery operations.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {featureCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 text-sm font-semibold rounded-full transition-all ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Features Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {features[activeCategory as keyof typeof features].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-sm text-slate-500">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">See Movva in Action</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Watch how businesses are using Movva to transform their delivery operations
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="group w-20 h-20 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
              {/* Video placeholder gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-amber-900/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Seamless Integrations</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Connect Movva with your existing tools and platforms
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-colors"
              >
                <span className="text-2xl">{integration.logo}</span>
                <span className="font-medium text-slate-700">{integration.name}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/docs" className="inline-flex items-center gap-2 text-orange-500 font-medium hover:text-orange-600">
              View all integrations <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to optimize your deliveries?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses in Ghana using Movva to deliver faster, 
            save costs, and delight customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">Movva</span>
            </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</Link>
              <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}