'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, ArrowRight, Clock, User, Tag, Search } from 'lucide-react';

const featuredPost = {
  title: 'The Complete Guide to Route Optimization for African Businesses',
  excerpt: 'Learn how AI-powered route optimization can help your business reduce delivery costs by up to 30% while improving customer satisfaction.',
  author: 'Kofi Mensah',
  date: 'January 10, 2026',
  readTime: '12 min read',
  category: 'Guide',
  gradient: 'from-indigo-600 to-violet-600',
};

const posts = [
  {
    title: 'How QuickMart Reduced Delivery Costs by 32%',
    excerpt: 'A case study on how one of Ghana\'s largest e-commerce retailers transformed their delivery operations.',
    author: 'Ama Darko',
    date: 'January 8, 2026',
    readTime: '8 min read',
    category: 'Case Study',
  },
  {
    title: '5 Common Last-Mile Delivery Mistakes (And How to Avoid Them)',
    excerpt: 'Learn from the most common pitfalls we see businesses make when scaling their delivery operations.',
    author: 'Emmanuel Osei',
    date: 'January 5, 2026',
    readTime: '6 min read',
    category: 'Tips',
  },
  {
    title: 'Introducing: Real-time Customer Tracking Links',
    excerpt: 'We\'re excited to announce our new feature that lets your customers track their deliveries in real-time.',
    author: 'Product Team',
    date: 'January 3, 2026',
    readTime: '3 min read',
    category: 'Product Update',
  },
  {
    title: 'The Rise of Same-Day Delivery in Ghana',
    excerpt: 'How changing consumer expectations are reshaping the logistics landscape in West Africa.',
    author: 'Kofi Mensah',
    date: 'December 28, 2025',
    readTime: '10 min read',
    category: 'Industry',
  },
  {
    title: 'Managing Cash-on-Delivery at Scale: Best Practices',
    excerpt: 'COD remains the dominant payment method in Ghana. Here\'s how to manage it efficiently.',
    author: 'Akua Asante',
    date: 'December 22, 2025',
    readTime: '7 min read',
    category: 'Guide',
  },
  {
    title: 'Our 2025 Year in Review',
    excerpt: 'Looking back at a year of growth, new features, and the amazing customers who made it possible.',
    author: 'Team Movva',
    date: 'December 20, 2025',
    readTime: '5 min read',
    category: 'Company',
  },
];

const categories = ['All', 'Guide', 'Case Study', 'Product Update', 'Industry', 'Tips', 'Company'];

export default function BlogPage() {
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
            <Link
              href="/register"
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Blog</h1>
            <p className="text-xl text-slate-600">
              Insights, updates, and best practices for last-mile delivery optimization.
            </p>
          </div>

          {/* Search & Categories */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    cat === 'All'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Link href="/blog/route-optimization-guide" className="group block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${featuredPost.gradient} p-8 lg:p-12`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)]" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-6">
                  {featuredPost.category}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 group-hover:underline decoration-2 underline-offset-4">
                  {featuredPost.title}
                </h2>
                <p className="text-lg text-white/80 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href="#" className="group block h-full">
                  <div className="h-full bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{post.author}</span>
                      <span className="text-slate-400">{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors">
              Load more articles
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Subscribe to our newsletter</h2>
          <p className="text-slate-600 mb-6">Get the latest insights delivered to your inbox weekly.</p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button className="px-6 py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors">
              Subscribe
            </button>
          </form>
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
