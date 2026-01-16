'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Zap,
  Users,
  Globe,
  Coffee,
  Laptop,
  DollarSign,
  Building2,
} from 'lucide-react';

const benefits = [
  { icon: DollarSign, title: 'Competitive Salary', description: 'Market-rate compensation with equity options' },
  { icon: Heart, title: 'Health Insurance', description: 'Comprehensive medical coverage for you & family' },
  { icon: Coffee, title: 'Free Lunch', description: 'Daily meals at our Accra office' },
  { icon: Laptop, title: 'Remote Friendly', description: 'Work from anywhere in Africa' },
  { icon: Building2, title: 'Learning Budget', description: '₵5,000 annual learning & development fund' },
  { icon: Globe, title: 'Paid Time Off', description: '25 days vacation + public holidays' },
];

const openings = [
  {
    title: 'Senior Backend Engineer',
    department: 'Engineering',
    location: 'Accra / Remote',
    type: 'Full-time',
    description: 'Build scalable APIs and microservices that power thousands of deliveries daily.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Accra / Remote',
    type: 'Full-time',
    description: 'Design beautiful, intuitive experiences for our web and mobile applications.',
  },
  {
    title: 'Machine Learning Engineer',
    department: 'Engineering',
    location: 'Accra / Remote',
    type: 'Full-time',
    description: 'Improve our route optimization algorithms using real-world delivery data.',
  },
  {
    title: 'Account Executive',
    department: 'Sales',
    location: 'Accra',
    type: 'Full-time',
    description: 'Close enterprise deals and help businesses transform their delivery operations.',
  },
  {
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'Accra / Lagos',
    type: 'Full-time',
    description: 'Ensure our customers achieve their delivery optimization goals.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build and maintain our cloud infrastructure on AWS/GCP.',
  },
];

const values = [
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'We ship quickly and learn from real-world feedback.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Every decision starts with understanding customer needs.',
  },
  {
    icon: Heart,
    title: 'Care Deeply',
    description: 'We care about each other, our customers, and our impact.',
  },
  {
    icon: Globe,
    title: 'Think Big',
    description: 'We\'re building infrastructure for an entire continent.',
  },
];

export default function CareersPage() {
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
              href="/register"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-white" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-sm font-medium text-orange-700 mb-6"
          >
            <Briefcase className="w-4 h-4" />
            We&apos;re Hiring
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1]"
          >
            Build the future of
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              African logistics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-2xl mx-auto mb-10"
          >
            Join our team of builders, operators, and dreamers working to make delivery 
            logistics accessible for every business in Africa.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <a
              href="#openings"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-full hover:bg-slate-800 transition-colors"
            >
              View open positions
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How we work</h2>
            <p className="text-lg text-slate-600">Our values guide everything we do.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <value.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Perks & Benefits</h2>
            <p className="text-lg text-slate-600">We take care of our team so they can take care of our customers.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <benefit.icon className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Open Positions</h2>
            <p className="text-lg text-slate-600">Find your next opportunity at Movva.</p>
          </div>

          <div className="space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/careers/${job.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-orange-200 transition-all duration-300 group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-2">
                        {job.title}
                      </h3>
                      <p className="text-slate-600 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">
              Don&apos;t see a role that fits? We&apos;re always looking for talented people.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-orange-600 font-medium hover:text-orange-700"
            >
              Send us your resume
              <ArrowRight className="w-4 h-4" />
            </Link>
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
