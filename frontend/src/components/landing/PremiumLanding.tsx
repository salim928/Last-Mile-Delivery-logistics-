'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Menu,
  X,
  MapPin,
  Truck,
  Clock,
  TrendingUp,
  Route,
  Package,
  Smartphone,
  CheckCircle2,
  Shield,
  BarChart3,
  ChevronRight,
  Navigation,
  Wallet,
  Star,
  Camera,
  Users,
  Zap,
  Globe,
  Play,
} from 'lucide-react';

// ============================================================================
// STRIPE-INSPIRED LANDING PAGE
// Authentic Stripe design language: Bold gradients, clean typography,
// product-focused cards, and professional aesthetics
// ============================================================================

export default function PremiumLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside nav
      if (!target.closest('nav')) {
        setMobileMenuOpen(false);
      }
    };
    
    // Add listener with slight delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* ================================================================
          NAVIGATION - Premium Glass Morphism Style
          ================================================================ */}
      <nav className="fixed top-0 w-full z-50">
        {/* Glass background with blur */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_2px_20px_rgba(0,0,0,0.04)]" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500" />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-[22px] font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Movva
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-0.5 p-1.5 rounded-2xl bg-slate-50/80">
                {[
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Demo', href: '/demo' },
                  { label: 'Resources', href: '/resources' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="relative px-5 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/login"
                className="px-5 py-2.5 text-[14px] font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 text-[14px] font-semibold text-white overflow-hidden rounded-xl transition-all duration-300"
              >
                {/* Button gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                {/* Shadow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-lg shadow-orange-500/40 rounded-xl transition-opacity" />
                <span className="relative">Get Started</span>
                <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 -mr-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[55]"
            style={{ top: '72px' }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden fixed left-0 right-0 bg-white border-t border-slate-100 shadow-2xl z-[60]"
            style={{ top: '72px' }}
          >
            <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-72px)] overflow-y-auto">
              {[
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Demo', href: '/demo' },
                { label: 'Resources', href: '/resources' },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block py-3 px-4 text-base text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                <Link
                  href="/login"
                  className="block py-3 px-4 text-base text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block py-3 px-4 text-center text-base text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl font-semibold shadow-lg shadow-orange-500/25 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ================================================================
          HERO SECTION - Stripe-Style with Gradient Background
          ================================================================ */}
      <section ref={heroRef} className="relative pt-32 pb-24 overflow-hidden">
        {/* Stripe-style gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main gradient mesh */}
          <div className="absolute top-0 right-0 w-[80%] h-[120%] opacity-40">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-400 blur-[120px]" />
            <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-300 via-amber-300 to-yellow-400 blur-[100px]" />
            <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 blur-[80px]" />
          </div>
          {/* Subtle grid overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 mb-8"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                </span>
                <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Trusted by 500+ businesses in Ghana
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-[68px] font-bold leading-[1.05] tracking-tight mb-8"
              >
                <span className="text-slate-900">Delivery logistics</span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  infrastructure
                </span>
                <br />
                <span className="text-slate-900">for Africa</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg"
              >
                Millions of businesses use Movva to optimize routes, track deliveries in real-time, 
                and reduce costs by up to 30%—all from a single platform.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link
                  href="/register"
                  className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white overflow-hidden rounded-xl transition-all duration-500"
                >
                  {/* Button gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {/* Shadow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 shadow-xl shadow-orange-500/30 rounded-xl transition-opacity" />
                  <span className="relative">Start free trial</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-slate-700 bg-white/80 backdrop-blur-sm border-2 border-slate-200/80 rounded-xl hover:border-orange-300 hover:bg-white hover:shadow-lg transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  Watch demo
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={heroInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 text-sm text-slate-500"
              >
                {[
                  'No credit card required',
                  'Free 14-day trial',
                  '5-minute setup',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Product Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-3xl blur-2xl" />
              
              {/* Main Dashboard Card */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                {/* Top Bar */}
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">Movva Dashboard</span>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 rounded-full">
                    <span className="text-xs font-semibold text-emerald-600">Live</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Active Routes', value: '24', change: '+8 today', icon: Route, color: 'indigo' },
                      { label: 'Deliveries', value: '1,847', change: '+23%', icon: Package, color: 'violet' },
                      { label: 'Cost Saved', value: '₵12.4k', change: '+31%', icon: TrendingUp, color: 'emerald' },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                          <span className="text-xs font-medium text-emerald-600">{stat.change}</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Map Preview */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl overflow-hidden">
                    {/* Simulated map elements */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M40 150 Q 100 50, 200 80 T 360 40"
                        stroke="url(#routeGrad)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="8 4"
                      />
                    </svg>
                    
                    {/* Delivery Points */}
                    {[
                      { x: '10%', y: '75%', label: 'Depot', color: 'emerald' },
                      { x: '35%', y: '35%', label: 'Stop 1', color: 'indigo' },
                      { x: '60%', y: '45%', label: 'Stop 2', color: 'indigo' },
                      { x: '85%', y: '20%', label: 'Stop 3', color: 'indigo' },
                    ].map((point, i) => (
                      <div
                        key={i}
                        className="absolute"
                        style={{ left: point.x, top: point.y, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className={`w-4 h-4 rounded-full bg-${point.color}-500 shadow-lg animate-pulse`} />
                      </div>
                    ))}

                    {/* Rider Card */}
                    <div className="absolute bottom-3 right-3 p-3 bg-white rounded-xl shadow-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                          KM
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Kofi M.</p>
                          <p className="text-xs text-slate-500">5/8 deliveries • On time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================
          LOGOS SECTION - Premium Social Proof
          ================================================================ */}
      <section className="relative py-20 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-white" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-100/40 via-transparent to-transparent" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-xs font-semibold tracking-[0.2em] text-slate-400 mb-12 uppercase"
          >
            Trusted by innovative companies
          </motion.p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {['QuickMart', 'FreshBox', 'GH Express', 'DeliveryPro', 'SwiftGo', 'JumiaPay'].map((company, i) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative px-6 py-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <span className="relative text-lg font-bold text-slate-300 group-hover:text-slate-500 transition-colors duration-300">
                  {company}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS - Stripe-Style Interactive Section
          ================================================================ */}
      <section id="products" className="py-32 bg-[#F6F9FC] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/50 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-100/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Section Header - Left aligned like Stripe */}
          <div className="max-w-2xl mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-orange-600 font-semibold mb-4 tracking-wide uppercase text-sm"
            >
              How it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-slate-900 leading-[1.1] mb-6"
            >
              Designed for the way
              <br />you actually work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 leading-relaxed"
            >
              Four streamlined steps take you from scattered orders to optimized 
              deliveries—automatically.
            </motion.p>
          </div>

          {/* Interactive Steps with Visuals */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Step Cards */}
            <div className="space-y-6">
              {[
                {
                  step: '01',
                  title: 'Import your orders',
                  description: 'Upload CSV files, connect via API, or enter orders manually. We handle thousands of orders in seconds.',
                  icon: Package,
                  gradient: 'from-blue-500 to-cyan-500',
                },
                {
                  step: '02',
                  title: 'AI optimizes routes',
                  description: 'Our algorithms consider traffic, distances, time windows, and vehicle capacity to find the best routes.',
                  icon: Route,
                  gradient: 'from-amber-500 to-purple-500',
                },
                {
                  step: '03',
                  title: 'Dispatch to riders',
                  description: 'One-click dispatch sends routes to your riders\' mobile app with turn-by-turn navigation.',
                  icon: Navigation,
                  gradient: 'from-orange-500 to-pink-500',
                },
                {
                  step: '04',
                  title: 'Track & confirm',
                  description: 'Monitor deliveries in real-time. Capture photos, signatures, and OTP verification automatically.',
                  icon: CheckCircle2,
                  gradient: 'from-emerald-500 to-teal-500',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`group relative flex gap-6 p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? 'bg-white shadow-xl shadow-slate-200/50' 
                      : 'hover:bg-white/60'
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  {/* Step indicator line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg transition-transform duration-300 ${activeFeature === index ? 'scale-110' : ''}`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    {index < 3 && (
                      <div className={`w-0.5 flex-1 mt-4 transition-colors duration-300 ${activeFeature > index ? 'bg-gradient-to-b from-orange-500 to-amber-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="text-xs font-bold text-slate-400 mb-2">STEP {item.step}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Active indicator */}
                  {activeFeature === index && (
                    <motion.div
                      layoutId="activeStepIndicator"
                      className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Right: Visual Preview */}
            <div className="sticky top-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
                
                {/* Preview Card */}
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                  <AnimatePresence mode="wait">
                    {activeFeature === 0 && (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-semibold text-slate-900">Import Orders</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">Ready</span>
                        </div>
                        <div className="space-y-3">
                          {['ORD-2847 • Kofi Mensah • East Legon', 'ORD-2848 • Ama Darko • Osu', 'ORD-2849 • Yaw Boateng • Tema'].map((order, i) => (
                            <motion.div
                              key={order}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                            >
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <Package className="w-5 h-5 text-white" />
                              </div>
                              <span className="flex-1 text-sm text-slate-700">{order}</span>
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            </motion.div>
                          ))}
                        </div>
                        <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-100">
                          <p className="text-sm text-orange-700"><strong>247 orders</strong> imported successfully</p>
                        </div>
                      </motion.div>
                    )}
                    {activeFeature === 1 && (
                      <motion.div
                        key="optimize"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-semibold text-slate-900">Route Optimization</h4>
                          <span className="px-3 py-1 bg-orange-50 text-amber-600 text-xs font-semibold rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            Optimizing
                          </span>
                        </div>
                        <div className="relative h-48 bg-slate-50 rounded-xl mb-6 overflow-hidden">
                          <svg className="w-full h-full" viewBox="0 0 400 200">
                            <motion.path
                              d="M40 150 Q 100 50, 200 80 T 360 40"
                              stroke="url(#optimizeGrad)"
                              strokeWidth="3"
                              fill="none"
                              strokeLinecap="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                            <defs>
                              <linearGradient id="optimizeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#A855F7" />
                              </linearGradient>
                            </defs>
                            {[{ x: 40, y: 150 }, { x: 140, y: 70 }, { x: 260, y: 95 }, { x: 360, y: 40 }].map((p, i) => (
                              <motion.circle
                                key={i}
                                cx={p.x}
                                cy={p.y}
                                r="8"
                                fill={i === 0 ? '#10B981' : '#8B5CF6'}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.2 }}
                              />
                            ))}
                          </svg>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {[{ label: 'Distance', value: '47.2 km', sub: '-23% optimized' }, { label: 'Time', value: '2h 15m', sub: '-31 min saved' }, { label: 'Fuel', value: '₵89', sub: '-28% saved' }].map((stat) => (
                            <div key={stat.label} className="p-3 bg-slate-50 rounded-xl text-center">
                              <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                              <p className="text-xs text-emerald-600">{stat.sub}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {activeFeature === 2 && (
                      <motion.div
                        key="dispatch"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-semibold text-slate-900">Rider Dispatch</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">3 Active</span>
                        </div>
                        <div className="space-y-4">
                          {[
                            { name: 'Kofi M.', route: 'Route A', stops: '8 stops', status: 'active', progress: 62 },
                            { name: 'Ama K.', route: 'Route B', stops: '6 stops', status: 'active', progress: 33 },
                            { name: 'Yaw B.', route: 'Route C', stops: '7 stops', status: 'pending', progress: 0 },
                          ].map((rider, i) => (
                            <motion.div
                              key={rider.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-4 bg-slate-50 rounded-xl"
                            >
                              <div className="flex items-center gap-4 mb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                  {rider.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="flex-1">
                                  <p className="font-semibold text-slate-900">{rider.name}</p>
                                  <p className="text-xs text-slate-500">{rider.route} • {rider.stops}</p>
                                </div>
                                {rider.status === 'active' ? (
                                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Live
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium text-slate-400">Pending</span>
                                )}
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${rider.progress}%` }}
                                  transition={{ duration: 1, delay: i * 0.2 }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {activeFeature === 3 && (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-semibold text-slate-900">Proof of Delivery</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full">Verified</span>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 mb-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-emerald-800">Delivery Confirmed</p>
                              <p className="text-sm text-emerald-600">ORD-2847 • 2:34 PM</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {[{ icon: Camera, label: 'Photo' }, { icon: Users, label: 'Signature' }, { icon: Shield, label: 'OTP' }].map((item) => (
                              <div key={item.label} className="p-3 bg-white rounded-xl text-center">
                                <item.icon className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                <p className="text-xs text-emerald-700">{item.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                          <span className="text-sm text-slate-600">Customer Rating</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES - Stripe-Style Product Cards with Interactive Elements
          ================================================================ */}
      <section id="solutions" className="py-32 bg-white relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Section Header */}
          <div className="max-w-2xl mb-20">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-orange-600 font-semibold mb-4 tracking-wide uppercase text-sm"
            >
              Platform Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-slate-900 leading-[1.1] mb-6"
            >
              Everything you need
              <br />to deliver faster
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 leading-relaxed"
            >
              A complete infrastructure for last-mile delivery operations, 
              built for scale and designed for Africa.
            </motion.p>
          </div>

          {/* Feature Cards - Stripe-like asymmetric grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Hero Feature - Route Optimization */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-7 group"
            >
              <div className="h-full relative rounded-3xl overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540] via-[#1a365d] to-[#0d1f33]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent" />
                
                {/* Content */}
                <div className="relative z-10 p-10 lg:p-12 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <Route className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-cyan-400 font-semibold text-sm">Core Feature</span>
                  </div>

                  <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                    AI Route Optimization
                  </h3>
                  <p className="text-lg text-slate-300 mb-8 max-w-md leading-relaxed">
                    Machine learning that understands African roads, traffic patterns, and 
                    delivery constraints to create optimal routes in seconds.
                  </p>

                  {/* Interactive route visualization */}
                  <div className="flex-1 relative min-h-[200px] mt-4">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                      {/* Route path */}
                      <motion.path
                        d="M40 150 Q 100 80, 180 100 T 320 60 T 460 90"
                        stroke="url(#routeGradient)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                      <defs>
                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22D3EE" />
                          <stop offset="50%" stopColor="#818CF8" />
                          <stop offset="100%" stopColor="#C084FC" />
                        </linearGradient>
                      </defs>
                      
                      {/* Stop points */}
                      {[
                        { x: 40, y: 150, label: 'A', delay: 0.3 },
                        { x: 180, y: 100, label: 'B', delay: 0.6 },
                        { x: 320, y: 60, label: 'C', delay: 0.9 },
                        { x: 460, y: 90, label: 'D', delay: 1.2 },
                      ].map((point, i) => (
                        <motion.g key={i}>
                          <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r="16"
                            fill="rgba(34, 211, 238, 0.2)"
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: point.delay }}
                          />
                          <motion.circle
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill={i === 0 ? '#10B981' : '#22D3EE'}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: point.delay + 0.1 }}
                          />
                          <motion.text
                            x={point.x}
                            y={point.y + 4}
                            textAnchor="middle"
                            fill="white"
                            fontSize="10"
                            fontWeight="bold"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: point.delay + 0.2 }}
                          >
                            {point.label}
                          </motion.text>
                        </motion.g>
                      ))}
                    </svg>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                    {[
                      { value: '30%', label: 'Cost Savings' },
                      { value: '<2s', label: 'Optimization' },
                      { value: '2.5x', label: 'Efficiency' },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right column - stacked cards */}
            <div className="lg:col-span-5 space-y-6">
              {/* Real-time Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="group"
              >
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/50 hover:shadow-2xl hover:shadow-emerald-200/40 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent" />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/25">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Live
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-time Tracking</h3>
                    <p className="text-slate-600 leading-relaxed">
                      GPS updates every 30 seconds. Share live tracking links with customers automatically.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Rider Mobile App */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group"
              >
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200/50 hover:shadow-2xl hover:shadow-orange-200/40 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-orange-100/50 via-transparent to-transparent" />
                  
                  <div className="relative">
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/25">
                      <div className="absolute -inset-2 bg-amber-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Smartphone className="relative w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Rider Mobile App</h3>
                    <p className="text-slate-600 leading-relaxed mb-5">
                      Turn-by-turn navigation, offline mode, and one-tap delivery confirmations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['iOS', 'Android', 'Offline'].map((tag) => (
                        <span key={tag} className="px-4 py-1.5 bg-orange-100/80 text-orange-700 text-xs font-semibold rounded-full border border-orange-200/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom row - 3 equal cards */}
            {[
              {
                icon: Wallet,
                title: 'COD Management',
                description: 'Track cash-on-delivery with automatic daily reconciliation. 99.8% accuracy guaranteed.',
                gradient: 'from-amber-50 to-orange-50',
                border: 'border-amber-100',
                iconGradient: 'from-amber-500 to-orange-500',
                shadow: 'hover:shadow-amber-100/50',
              },
              {
                icon: Camera,
                title: 'Proof of Delivery',
                description: 'Photos, signatures, and OTP verification. Legally compliant digital records.',
                gradient: 'from-cyan-50 to-sky-50',
                border: 'border-cyan-100',
                iconGradient: 'from-cyan-500 to-sky-500',
                shadow: 'hover:shadow-cyan-100/50',
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Real-time insights, performance metrics, and exportable reports.',
                gradient: 'from-pink-50 to-rose-50',
                border: 'border-pink-100',
                iconGradient: 'from-pink-500 to-rose-500',
                shadow: 'hover:shadow-pink-100/50',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="lg:col-span-4"
              >
                <div className={`group h-full p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} ${feature.border} border hover:shadow-2xl ${feature.shadow} hover:-translate-y-1 transition-all duration-500 relative overflow-hidden`}>
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <div className="relative mb-6">
                      <div className={`absolute -inset-2 bg-gradient-to-br ${feature.iconGradient} rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition-opacity`} />
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          STATS - Premium Dark Section with Glass Cards
          ================================================================ */}
      <section className="relative py-36 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-orange-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="max-w-2xl mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-400">By the numbers</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-white leading-[1.1]"
            >
              Powering deliveries
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">across Ghana</span>
            </motion.h2>
          </div>

          {/* Stats grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                value: '10,000+', 
                label: 'Daily Deliveries', 
                description: 'Optimized every single day',
                gradient: 'from-cyan-400 to-blue-500',
              },
              { 
                value: '30%', 
                label: 'Cost Reduction', 
                description: 'Average client savings',
                gradient: 'from-orange-400 to-amber-500',
              },
              { 
                value: '99.2%', 
                label: 'On-Time Rate', 
                description: 'Delivery success rate',
                gradient: 'from-emerald-400 to-teal-500',
              },
              { 
                value: '500+', 
                label: 'Companies', 
                description: 'Trust Movva daily',
                gradient: 'from-pink-400 to-rose-500',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-500 overflow-hidden">
                  {/* Gradient line at top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
                  
                  {/* Glow on hover */}
                  <div className={`absolute -inset-px bg-gradient-to-b ${stat.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                  
                  <div className={`text-5xl lg:text-6xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-4`}>
                    {stat.value}
                  </div>
                  <div className="text-xl font-semibold text-white mb-2">{stat.label}</div>
                  <div className="text-sm text-slate-400">{stat.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS - Premium Glass Cards
          ================================================================ */}
      <section className="py-32 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-orange-50/30" />
        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-gradient-to-br from-orange-100/60 via-violet-100/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-100/40 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/60 backdrop-blur-sm border border-orange-200/50 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-sm font-semibold text-orange-700">Why Businesses Choose Us</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-slate-900 leading-[1.1]"
              >
                Built for the realities
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">of African logistics</span>
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-xl shadow-slate-200/30"
            >
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">30%</div>
                <div className="flex gap-1 justify-center my-2">
                  {[1,2,3,4,5].map((s) => (
                    <TrendingUp key={s} className="w-5 h-5 text-emerald-500" />
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-600">average cost savings</div>
              </div>
            </motion.div>
          </div>

          {/* Feature Highlights */}
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              {
                quote: "Purpose-built route optimization that understands Accra's unique traffic patterns, unmarked addresses, and local delivery challenges.",
                name: 'Route Intelligence',
                role: 'Smart Algorithms',
                company: 'Core Feature',
                metric: '25%',
                metricLabel: 'Faster deliveries',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                quote: "Works seamlessly even in areas with poor network coverage. Riders can continue deliveries offline and sync when connectivity returns.",
                name: 'Offline-First Design',
                role: 'Reliable Operations',
                company: 'Core Feature',
                metric: '99.9%',
                metricLabel: 'Uptime',
                gradient: 'from-amber-500 to-purple-500',
              },
              {
                quote: "Track every cedi with automated COD reconciliation. Real-time visibility into cash collections with instant discrepancy alerts.",
                name: 'COD Management',
                role: 'Financial Control',
                company: 'Core Feature',
                metric: '100%',
                metricLabel: 'Cash visibility',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group"
              >
                <div className="h-full p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-white/60 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/30 hover:-translate-y-1 transition-all duration-500">
                  {/* Metric highlight */}
                  <div className="relative overflow-hidden inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200/50 mb-8">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.metric}
                    </span>
                    <span className="text-sm font-medium text-slate-600">{feature.metricLabel}</span>
                    {/* Subtle shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  <p className="text-lg text-slate-700 leading-relaxed mb-8">
                    {feature.quote}
                  </p>

                  <div className="flex items-center gap-4 pt-6 border-t border-slate-100/80">
                    <div className="relative">
                      <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-xl opacity-30 blur-sm`} />
                      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
                        <Zap className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{feature.name}</div>
                      <div className="text-sm text-slate-500">{feature.role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          CTA - Premium Full-Width Section
          ================================================================ */}
      <section className="relative py-36 overflow-hidden">
        {/* Premium dark gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px]">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/20 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white/90 mb-10">
              <div className="relative">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
              </div>
              Get started in minutes
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.05]">
              Ready to deliver
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  smarter?
                </span>
                {/* Underline decoration */}
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path
                    d="M0 8 Q 50 0, 100 8 T 200 8"
                    stroke="url(#underlineGrad)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underlineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22D3EE" />
                      <stop offset="50%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#C084FC" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-slate-300 mb-14 max-w-2xl mx-auto leading-relaxed">
              AI-powered route optimization built for the realities of African logistics. 
              Start optimizing your deliveries today.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 overflow-hidden rounded-2xl transition-all duration-500"
              >
                {/* Button background */}
                <div className="absolute inset-0 bg-white" />
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {/* Shadow */}
                <div className="absolute inset-0 shadow-2xl shadow-white/20 rounded-2xl" />
                <span className="relative text-base font-bold text-slate-900">Start Free Trial</span>
                <ArrowRight className="relative w-5 h-5 text-slate-900 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-500"
              >
                <Play className="w-5 h-5 text-white" />
                <span className="text-base font-bold text-white">Try Interactive Demo</span>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              {[
                { text: 'No credit card required', icon: CheckCircle2 },
                { text: '14-day free trial', icon: CheckCircle2 },
                { text: 'Cancel anytime', icon: CheckCircle2 },
              ].map((item) => (
                <span key={item.text} className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                  <item.icon className="w-4 h-4 text-emerald-400" />
                  {item.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          FOOTER - Premium Dark Style
          ================================================================ */}
      <footer className="relative py-24 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-black" />
        {/* Subtle glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-orange-500/10 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="group flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500" />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-purple-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold text-white">Movva</span>
              </Link>
              <p className="text-slate-400 max-w-sm leading-relaxed mb-8">
                AI-powered route optimization for last-mile delivery. Built for the realities of African logistics.
              </p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: [
                { label: 'Features', href: '/features' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Demo', href: '/demo' },
                { label: 'API Docs', href: '/docs' },
                { label: 'Resources', href: '/resources' },
              ]},
              { title: 'Company', links: [
                { label: 'About', href: '/about' },
                { label: 'Blog', href: '/blog' },
                { label: 'Careers', href: '/careers' },
                { label: 'Contact', href: '/contact' },
              ]},
              { title: 'Support', links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Status', href: '/status' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ]},
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-white mb-5">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-sm">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10">
            <p className="text-sm text-slate-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} Movva Technologies Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm text-slate-400">
                <Globe className="w-4 h-4" />
                Ghana
              </span>
              <span className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-400">
                <Shield className="w-4 h-4" />
                SOC 2 Compliant
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

