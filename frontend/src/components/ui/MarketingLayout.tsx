'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Menu, X, ArrowRight } from 'lucide-react';

interface MarketingLayoutProps {
  children: React.ReactNode;
  showCTA?: boolean;
}

export default function MarketingLayout({ children, showCTA = true }: MarketingLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* ================================================================
          NAVIGATION - Stripe-Style Glass Morphism
          ================================================================ */}
      <nav className="fixed top-0 w-full z-50 safe-area-top">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_20px_rgba(0,0,0,0.04)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition-all duration-500" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Movva
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-50/80">
                {[
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Demo', href: '/demo' },
                  { label: 'Resources', href: '/resources' },
                  { label: 'Contact', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            {showCTA && (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Sign in
                </Link>
                <Link
                  href="/demo"
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white overflow-hidden rounded-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </div>
                  <span className="relative">Try Demo</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-3 -mr-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors touch-manipulation"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto safe-area-bottom">
                {[
                  { label: 'Features', href: '/features' },
                  { label: 'Pricing', href: '/pricing' },
                  { label: 'Demo', href: '/demo' },
                  { label: 'Resources', href: '/resources' },
                  { label: 'Contact', href: '/contact' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 px-4 text-base text-slate-600 hover:text-slate-900 active:bg-slate-100 hover:bg-slate-50 rounded-xl font-medium transition-colors touch-manipulation"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 px-4 text-base text-slate-600 hover:text-slate-900 active:bg-slate-100 hover:bg-slate-50 rounded-xl font-medium transition-colors touch-manipulation"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 px-4 text-center text-base text-white bg-gradient-to-r from-orange-500 to-amber-500 active:from-orange-600 active:to-amber-600 rounded-xl font-semibold transition-colors touch-manipulation"
                  >
                    Try Demo
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-16 sm:pt-[72px]">
        {children}
      </main>

      {/* ================================================================
          FOOTER - Stripe-Style Professional
          ================================================================ */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          {/* Main Footer */}
          <div className="py-10 sm:py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1 mb-4 sm:mb-0">
              <Link href="/" className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Movva</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI-powered route optimization for last-mile delivery in Africa.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['Features', 'Pricing', 'Demo', 'API'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm transition-colors py-1 block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm transition-colors py-1 block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['Documentation', 'Help Center', 'Status', 'Partners'].map((item) => (
                  <li key={item}>
                    <Link href={item === 'Documentation' ? '/docs' : item === 'Help Center' ? '/help' : `/${item.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm transition-colors py-1 block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 sm:space-y-3">
                {['Privacy', 'Terms', 'Security'].map((item) => (
                  <li key={item}>
                    <Link href={`/${item.toLowerCase()}`} className="text-slate-400 hover:text-white text-sm transition-colors py-1 block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-4 sm:py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className="text-slate-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} Movva Technologies Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs sm:text-sm">Built with 🇬🇭 in Ghana</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
