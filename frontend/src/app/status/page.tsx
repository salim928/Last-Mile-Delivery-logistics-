'use client';

import Link from 'next/link';
import { Truck, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';

const services = [
  { name: 'Web Dashboard', status: 'operational', uptime: '99.99%' },
  { name: 'API', status: 'operational', uptime: '99.98%' },
  { name: 'Rider Mobile App', status: 'operational', uptime: '99.97%' },
  { name: 'Route Optimization Engine', status: 'operational', uptime: '99.95%' },
  { name: 'GPS Tracking', status: 'operational', uptime: '99.99%' },
  { name: 'Webhooks', status: 'operational', uptime: '99.96%' },
  { name: 'SMS Notifications', status: 'operational', uptime: '99.90%' },
  { name: 'Email Service', status: 'operational', uptime: '99.99%' },
];

const incidents = [
  {
    date: 'January 14, 2026',
    title: 'Scheduled Maintenance Complete',
    status: 'resolved',
    description: 'Database migration completed successfully with no impact to service.',
  },
  {
    date: 'January 10, 2026',
    title: 'API Latency Increase',
    status: 'resolved',
    description: 'Increased API response times due to high traffic. Scaled infrastructure and performance is back to normal.',
  },
  {
    date: 'January 5, 2026',
    title: 'SMS Delivery Delays',
    status: 'resolved',
    description: 'SMS notifications experienced 15-minute delays due to carrier issues. All messages delivered.',
  },
];

const statusColors = {
  operational: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle, iconColor: 'text-emerald-500' },
  degraded: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertTriangle, iconColor: 'text-amber-500' },
  outage: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle, iconColor: 'text-red-500' },
  resolved: { bg: 'bg-slate-50', text: 'text-slate-700', icon: CheckCircle, iconColor: 'text-slate-500' },
};

export default function StatusPage() {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Movva</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">Status</span>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Back to Movva
            </Link>
          </div>
        </div>
      </nav>

      {/* Overall Status */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className={`rounded-2xl p-8 ${allOperational ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-4">
              {allOperational ? (
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-amber-500" />
              )}
              <div>
                <h1 className={`text-2xl font-bold ${allOperational ? 'text-emerald-800' : 'text-amber-800'}`}>
                  {allOperational ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
                </h1>
                <p className={`${allOperational ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Last updated: {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Services</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {services.map((service, index) => {
              const statusConfig = statusColors[service.status as keyof typeof statusColors];
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={service.name}
                  className={`flex items-center justify-between p-4 ${
                    index !== services.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
                    <span className="font-medium text-slate-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500">{service.uptime} uptime</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 90-day uptime */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">90-Day Uptime</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex gap-1">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-8 rounded-sm ${
                    Math.random() > 0.02 ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  title={`Day ${90 - i}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-slate-500">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span className="text-sm text-slate-600">Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-400" />
                <span className="text-sm text-slate-600">Degraded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-400" />
                <span className="text-sm text-slate-600">Outage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Past Incidents */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Past Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident, index) => {
              const statusConfig = statusColors[incident.status as keyof typeof statusColors];
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 p-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      {incident.date}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{incident.title}</h3>
                  <p className="text-slate-600">{incident.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="bg-slate-50 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Subscribe to Updates</h2>
            <p className="text-slate-600 mb-6">Get notified when there&apos;s an incident or scheduled maintenance.</p>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Movva Technologies Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
