'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck,
  Users,
  Target,
  Heart,
  Globe,
  Zap,
  ArrowRight,
  Linkedin,
  Twitter,
  MapPin,
} from 'lucide-react';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We\'re on a mission to make delivery logistics accessible and efficient for every business in Africa.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Heart,
    title: 'Customer Obsessed',
    description: 'Every feature we build starts with understanding the real challenges our customers face daily.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'We ship quickly, learn from feedback, and iterate. Progress over perfection.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Built for Africa',
    description: 'We understand the unique challenges of African logistics—offline support, COD, and local infrastructure.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const team = [
  {
    name: 'Kofi Mensah',
    role: 'CEO & Co-Founder',
    bio: 'Former logistics head at Jumia Ghana. 10+ years in e-commerce operations.',
    image: 'KM',
  },
  {
    name: 'Ama Darko',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer. Built ML systems for route optimization at scale.',
    image: 'AD',
  },
  {
    name: 'Yaw Boateng',
    role: 'VP Engineering',
    bio: 'Previously at Flutterwave. Expert in building reliable African fintech infrastructure.',
    image: 'YB',
  },
  {
    name: 'Akua Asante',
    role: 'VP Product',
    bio: 'Former product lead at Bolt. Passionate about user-centered design.',
    image: 'AA',
  },
  {
    name: 'Emmanuel Osei',
    role: 'VP Sales',
    bio: '15 years in B2B enterprise sales across West Africa.',
    image: 'EO',
  },
  {
    name: 'Nana Adjei',
    role: 'VP Customer Success',
    bio: 'Built customer success teams at 3 African startups. Champion of customer voice.',
    image: 'NA',
  },
];

const milestones = [
  { year: '2021', event: 'Founded in Accra, Ghana' },
  { year: '2022', event: 'Launched MVP, 10 pilot customers' },
  { year: '2022', event: 'Raised $2M seed round' },
  { year: '2023', event: '100 customers milestone' },
  { year: '2023', event: 'Launched rider mobile app' },
  { year: '2024', event: '500+ companies using Movva' },
  { year: '2024', event: 'Expanded to Nigeria' },
  { year: '2025', event: '10,000+ daily deliveries optimized' },
];

const investors = ['Y Combinator', 'Seedstars', 'Launch Africa', 'GreenHouse Capital'];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
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
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-sm font-medium text-indigo-700 mb-6"
          >
            <Users className="w-4 h-4" />
            About Movva
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-[1.1]"
          >
            Making deliveries
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              work for Africa
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 max-w-3xl mx-auto"
          >
            We&apos;re building the infrastructure that makes last-mile delivery efficient, 
            affordable, and reliable across the African continent.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Movva was born out of frustration. As logistics professionals in Ghana, 
                  we saw firsthand how inefficient delivery operations wasted time, money, 
                  and caused endless headaches for businesses.
                </p>
                <p>
                  Routes planned on paper. Riders getting lost. Customers waiting without 
                  updates. Cash reconciliation nightmares at the end of every day. Sound familiar?
                </p>
                <p>
                  We knew there had to be a better way—one built specifically for African 
                  realities. Not a Silicon Valley solution shoehorned into our market, but 
                  technology designed from the ground up for our roads, our connectivity 
                  challenges, and our cash-heavy economy.
                </p>
                <p>
                  Today, Movva powers deliveries for 500+ companies across Ghana and Nigeria, 
                  optimizing over 10,000 deliveries every single day.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Our Journey</h3>
                <div className="space-y-6">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <span className="text-sm font-mono text-indigo-400 w-16 flex-shrink-0">
                        {milestone.year}
                      </span>
                      <div className="flex-1">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 mb-1" />
                        <p className="text-slate-300">{milestone.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Values</h2>
            <p className="text-lg text-slate-600">The principles that guide everything we do.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6`}>
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Leadership</h2>
            <p className="text-lg text-slate-600">
              Experienced operators who&apos;ve built and scaled businesses across Africa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-bold mb-6">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-4">{member.role}</p>
                <p className="text-slate-600 leading-relaxed mb-4">{member.bio}</p>
                <div className="flex gap-3">
                  <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Backed by world-class investors</h2>
          <div className="flex flex-wrap justify-center gap-12">
            {investors.map((investor) => (
              <span key={investor} className="text-xl font-semibold text-slate-400">
                {investor}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent)]" />

            <div className="relative z-10 py-16 px-8 lg:px-16 text-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Join our mission
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                We&apos;re hiring! Help us build the future of African logistics. See our open positions.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/careers"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full hover:bg-slate-100 transition-colors"
                >
                  View open roles
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Accra, Ghana</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
