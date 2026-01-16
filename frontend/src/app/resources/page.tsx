'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Book,
  Video,
  FileText,
  Code,
  Users,
  Lightbulb,
  ArrowRight,
  Download,
  Play,
  ExternalLink,
  Truck,
  Search,
  BookOpen,
  Headphones,
  GraduationCap,
  Newspaper,
} from 'lucide-react';

const categories = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides to help you get the most out of Movva.',
    icon: Book,
    gradient: 'from-orange-500 to-amber-500',
    links: [
      { title: 'Getting Started Guide', href: '/docs/getting-started', time: '5 min read' },
      { title: 'API Reference', href: '/docs/api', time: 'Reference' },
      { title: 'Integration Guides', href: '/docs/integrations', time: '10 min read' },
      { title: 'Best Practices', href: '/docs/best-practices', time: '15 min read' },
    ],
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides for visual learners.',
    icon: Video,
    gradient: 'from-orange-600 to-amber-600',
    links: [
      { title: 'Platform Overview', href: '/resources/videos/overview', time: '8 min' },
      { title: 'Route Optimization Deep Dive', href: '/resources/videos/routes', time: '12 min' },
      { title: 'Rider App Tutorial', href: '/resources/videos/rider-app', time: '6 min' },
      { title: 'Analytics & Reporting', href: '/resources/videos/analytics', time: '10 min' },
    ],
  },
  {
    title: 'Case Studies',
    description: 'Real-world success stories from Movva customers.',
    icon: FileText,
    gradient: 'from-amber-500 to-orange-500',
    links: [
      { title: 'QuickMart: 32% Cost Reduction', href: '/resources/case-studies/quickmart', time: 'Case Study' },
      { title: 'FreshBox: Scaling to 1000+ Daily', href: '/resources/case-studies/freshbox', time: 'Case Study' },
      { title: 'GH Express: COD Excellence', href: '/resources/case-studies/gh-express', time: 'Case Study' },
      { title: 'MedDeliver: Healthcare Logistics', href: '/resources/case-studies/meddeliver', time: 'Case Study' },
    ],
  },
  {
    title: 'Developer Resources',
    description: 'Technical documentation and API tools for developers.',
    icon: Code,
    gradient: 'from-orange-500 to-pink-500',
    links: [
      { title: 'API Documentation', href: '/docs/api', time: 'Reference' },
      { title: 'Webhooks Guide', href: '/docs/webhooks', time: '8 min read' },
      { title: 'SDKs & Libraries', href: '/docs/sdks', time: 'Downloads' },
      { title: 'Postman Collection', href: '/docs/postman', time: 'Download' },
    ],
  },
];

const featuredResources = [
  {
    type: 'Guide',
    title: 'The Complete Guide to Last-Mile Delivery Optimization in Ghana',
    description: 'Everything you need to know about optimizing deliveries for the Ghanaian market, from traffic patterns to COD management.',
    image: '/images/guide-ghana.jpg',
    href: '/resources/guides/ghana-optimization',
    gradient: 'from-orange-600 to-amber-600',
  },
  {
    type: 'Webinar',
    title: 'Scaling Your Delivery Operations: Lessons from 500+ Companies',
    description: 'Join our monthly webinar series where we share insights from helping hundreds of businesses scale.',
    image: '/images/webinar.jpg',
    href: '/resources/webinars/scaling',
    gradient: 'from-emerald-600 to-teal-600',
  },
  {
    type: 'Template',
    title: 'Delivery Operations Playbook',
    description: 'A comprehensive template for planning, executing, and measuring your delivery operations.',
    image: '/images/playbook.jpg',
    href: '/resources/templates/playbook',
    gradient: 'from-orange-600 to-pink-600',
  },
];

const quickLinks = [
  { title: 'Help Center', description: 'Find answers to common questions', icon: Headphones, href: '/help' },
  { title: 'Academy', description: 'Free courses to master Movva', icon: GraduationCap, href: '/academy' },
  { title: 'Blog', description: 'Latest news and insights', icon: Newspaper, href: '/blog' },
  { title: 'Community', description: 'Connect with other users', icon: Users, href: '/community' },
];

export default function ResourcesPage() {
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
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-700 mb-6"
          >
            <BookOpen className="w-4 h-4" />
            Resources & Learning
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1]"
          >
            Learn, grow, and
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              deliver better
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Everything you need to master last-mile delivery optimization—guides, tutorials, 
            case studies, and more.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-lg shadow-slate-200/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={link.href}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <link.icon className="w-6 h-6 text-slate-600 group-hover:text-orange-600 transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{link.title}</p>
                    <p className="text-sm text-slate-500">{link.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Resources</h2>
              <p className="text-slate-600">Hand-picked content to help you succeed.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={resource.href} className="group block h-full">
                  <div className="h-full rounded-3xl overflow-hidden bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300">
                    {/* Image placeholder */}
                    <div className={`h-48 bg-gradient-to-br ${resource.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                          {resource.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-slate-600">
              Find exactly what you&apos;re looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0`}>
                      <category.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{category.title}</h3>
                      <p className="text-slate-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {category.links.map((link) => (
                      <Link
                        key={link.title}
                        href={link.href}
                        className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <span className="font-medium text-slate-700 group-hover:text-orange-600 transition-colors">
                          {link.title}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-400">{link.time}</span>
                          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-orange-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent)]" />

            <div className="relative z-10 py-16 px-8 lg:px-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Stay ahead of the curve
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Get weekly insights on logistics optimization, industry trends, and Movva updates 
                delivered to your inbox.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
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
