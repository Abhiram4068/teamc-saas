import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [selectedTenant, setSelectedTenant] = useState('Acme Corp');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');

  const tenants = [
    {
      id: 1,
      name: 'Acme Corp',
      badge: 'A',
      badgeBg: 'bg-slate-900',
      users: '142 Users',
      mrr: '₹9,990',
      change: '+1.84%',
      isPositive: true,
    },
    {
      id: 2,
      name: 'XYZ Ltd',
      badge: 'X',
      badgeBg: 'bg-red-600',
      users: '28 Users',
      mrr: '₹4,990',
      change: '-0.8%',
      isPositive: false,
    },
    {
      id: 3,
      name: 'ABC Solutions',
      badge: 'A',
      badgeBg: 'bg-green-600',
      users: '512 Users',
      mrr: '₹24,990',
      change: '+4.05%',
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Teamo SuperAdmin Dashboard</h1>
      </div>

      {/* TOP METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Tenants</span>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">1,284</div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +12.4%
          </span>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Subscriptions</span>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">1,106</div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +4.2%
          </span>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Revenue</span>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">₹12.4L</div>
          </div>
          <span className="bg-rose-50 text-rose-500 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
            </svg>
            -0.6%
          </span>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Users</span>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">18,542</div>
          </div>
          <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            +8.1%
          </span>
        </div>
      </div>

      {/* MAIN FEATURE SECTION (TOP TENANTS GROWTH & ACTIVITY) */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-800">Top Tenants Growth & Activity</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Selected List Column */}
          <div className="lg:col-span-4 space-y-2">
            <div className="relative mb-3">
              <svg className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Enter Company or Symbol name"
                className="w-full text-xs border border-slate-200 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tenant Items */}
            {tenants.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTenant(item.name)}
                className={`rounded-lg p-3 flex items-center justify-between cursor-pointer transition border ${
                  selectedTenant === item.name
                    ? 'border-blue-500/50 bg-blue-50/30'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded ${item.badgeBg} text-white font-bold flex items-center justify-center text-xs`}
                  >
                    {item.badge}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.users}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800">{item.mrr}</div>
                  <div
                    className={`text-[10px] font-semibold ${
                      item.isPositive ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Chart View Column (Dummy Chart) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xl font-extrabold text-slate-800">{selectedTenant} MRR Growth</div>
                <div className="text-xs text-slate-400">Live analytics telemetry</div>
              </div>
              <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500">
                {['1D', '5D', '3M', '1Y', 'Max'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setActiveTimeframe(tf)}
                    className={`px-2 py-1 rounded transition ${
                      activeTimeframe === tf
                        ? 'bg-slate-800 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Styled Dummy SVG Chart Graphic */}
            <div className="h-56 relative border border-dashed border-slate-200 rounded-lg p-4 flex flex-col justify-between bg-slate-50/50">
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                <span>Revenue Telemetry Spectrum</span>
                <span className="text-blue-600 font-bold">● Active Stream</span>
              </div>

              <div className="w-full h-36 flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 80 Q 60 20, 120 70 T 240 40 T 360 80 T 500 30 L 500 120 L 0 120 Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M 0 80 Q 60 20, 120 70 T 240 40 T 360 80 T 500 30"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                <span>10 AM</span>
                <span>12 PM</span>
                <span>2 PM</span>
                <span>4 PM</span>
                <span>6 PM</span>
                <span>8 PM</span>
                <span>10 PM</span>
                <span>12 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN TABLES (RECENT TENANTS & RECENT PAYMENTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT TENANTS */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Tenants</h3>
            <Link to="/superadmin/tenants" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View all &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px]">
                  <th className="py-2">Tenant Name</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Acme Corp</td>
                  <td className="py-2.5">
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Pro</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">XYZ Ltd</td>
                  <td className="py-2.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Basic</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Active</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">ABC Solutions</td>
                  <td className="py-2.5">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">Enterprise</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Trial</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT PAYMENTS */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">Recent Payments</h3>
            <Link to="/superadmin/payments" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View all &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 uppercase text-[10px]">
                  <th className="py-2">Amount</th>
                  <th className="py-2">Tenant</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">₹999</td>
                  <td className="py-2.5">Acme Corp</td>
                  <td className="py-2.5 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Successful</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">₹499</td>
                  <td className="py-2.5">XYZ Ltd</td>
                  <td className="py-2.5 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Successful</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">₹2,499</td>
                  <td className="py-2.5">Global Logistics</td>
                  <td className="py-2.5 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Successful</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pt-6 border-t border-slate-200 text-xs text-slate-400 flex justify-between items-center">
        <div>Thank you for creating with Teamo | 2026 © Teamo SaaS</div>
        <div>v1.24.0</div>
      </footer>
    </div>
  );
}
