'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Search,
  Book,
  Code,
  Zap,
  ChevronRight,
  ArrowRight,
  FileText,
  Terminal,
  Settings,
  Database,
  Shield,
  Webhook
} from 'lucide-react';

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Zap },
  { id: 'api-reference', label: 'API Reference', icon: Code },
  { id: 'guides', label: 'Guides', icon: Book },
  { id: 'sdks', label: 'SDKs & Libraries', icon: Terminal },
  { id: 'webhooks', label: 'Webhooks', icon: Webhook },
];

const quickLinks = [
  { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes', href: '/docs/quickstart', icon: Zap },
  { title: 'API Authentication', description: 'Learn how to authenticate API requests', href: '/docs/authentication', icon: Shield },
  { title: 'Create Your First Order', description: 'Submit orders via API', href: '/docs/orders', icon: FileText },
  { title: 'Optimize Routes', description: 'Generate optimized delivery routes', href: '/docs/routes', icon: Settings },
];

const apiEndpoints = [
  { method: 'POST', path: '/api/v1/orders', description: 'Create a new delivery order' },
  { method: 'GET', path: '/api/v1/orders/{id}', description: 'Get order details' },
  { method: 'POST', path: '/api/v1/routes/optimize', description: 'Optimize delivery routes' },
  { method: 'GET', path: '/api/v1/riders', description: 'List all riders' },
  { method: 'POST', path: '/api/v1/pod', description: 'Upload proof of delivery' },
  { method: 'GET', path: '/api/v1/tracking/{id}', description: 'Get real-time tracking' },
];

const sdks = [
  { name: 'Python', version: '2.1.0', icon: '🐍', color: 'bg-yellow-400' },
  { name: 'JavaScript/Node', version: '3.0.1', icon: '📦', color: 'bg-yellow-300' },
  { name: 'PHP', version: '1.8.0', icon: '🐘', color: 'bg-indigo-400' },
  { name: 'Ruby', version: '1.5.0', icon: '💎', color: 'bg-red-400' },
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">Movva</span>
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-slate-600">Documentation</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-slate-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">⌘K</span>
              </div>
              <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors ${
                    activeSection === section.id 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Hero */}
            <div className="mb-12">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl font-bold text-slate-900 mb-4"
              >
                Movva API Documentation
              </motion.h1>
              <p className="text-xl text-slate-600 max-w-2xl">
                Everything you need to integrate Movva&apos;s logistics optimization into your applications.
              </p>
            </div>

            {/* Quick Links */}
            <section className="mb-16">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Link 
                    key={link.title}
                    href={link.href}
                    className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <link.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                          {link.title}
                        </h3>
                        <p className="text-sm text-slate-500">{link.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* API Reference Preview */}
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">API Reference</h2>
                <Link href="/docs/api" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  View all endpoints <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                  <span className="text-sm font-medium text-slate-400">Base URL</span>
                  <code className="text-sm text-emerald-400">https://api.movva.io/v1</code>
                </div>
                <div className="divide-y divide-slate-800">
                  {apiEndpoints.map((endpoint) => (
                    <div key={endpoint.path} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-800/50 transition-colors">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        endpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' :
                        endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm text-slate-300 font-mono">{endpoint.path}</code>
                      <span className="flex-1 text-sm text-slate-500 text-right">{endpoint.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SDKs */}
            <section className="mb-16">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Official SDKs</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {sdks.map((sdk) => (
                  <div key={sdk.name} className="p-5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{sdk.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900">{sdk.name}</h3>
                        <span className="text-xs text-slate-500">v{sdk.version}</span>
                      </div>
                    </div>
                    <Link href={`/docs/sdk/${sdk.name.toLowerCase()}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                      View documentation →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Code Example */}
            <section className="mb-16">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Quick Example</h2>
              <div className="bg-slate-900 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 text-sm text-slate-400">create_order.py</span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto">
                  <code className="text-slate-300">{`import movva

# Initialize the client
client = movva.Client(api_key="your_api_key")

# Create a delivery order
order = client.orders.create(
    customer_name="John Doe",
    customer_phone="+233501234567",
    delivery_address="15 Oxford Street, Osu, Accra",
    items=[
        {"name": "Package 1", "quantity": 2}
    ]
)

# Optimize routes for all pending orders
routes = client.routes.optimize(
    rider_ids=["rider_1", "rider_2"],
    algorithm="time_windows"
)

print(f"Created order: {order.id}")
print(f"Optimized {len(routes)} routes")`}</code>
                </pre>
              </div>
            </section>

            {/* Help */}
            <section className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-8 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Need Help?</h2>
                  <p className="text-indigo-100 mb-6 max-w-lg">
                    Our developer support team is here to help you integrate Movva into your applications.
                  </p>
                  <div className="flex gap-4">
                    <Link 
                      href="/help" 
                      className="px-5 py-2.5 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Help Center
                    </Link>
                    <Link 
                      href="/contact" 
                      className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Contact Support
                    </Link>
                  </div>
                </div>
                <Database className="w-24 h-24 text-white/20" />
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Movva Technologies Ltd.
            </p>
            <div className="flex gap-6">
              <Link href="/status" className="text-sm text-slate-500 hover:text-slate-900">API Status</Link>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">Privacy</Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
