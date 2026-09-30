import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axiosClient.get('/AdminUser/dashboard');
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const metrics = [
    { title: 'Total Revenue', value: dashboardData?.metrics?.totalRevenue?.value || '-', cardBg: 'bg-[#f4fef8]' },
    { title: 'Total Tenants', value: dashboardData?.metrics?.totalTenants?.value || '-', cardBg: 'bg-[#fffdf6]' },
    { title: 'Active Subs', value: dashboardData?.metrics?.activeSubscriptions?.value || '-', cardBg: 'bg-[#fffaf6]' },
    { title: 'Total Plans', value: dashboardData?.metrics?.totalPlans?.value || '-', cardBg: 'bg-[#f4fef8]' },
    { title: 'Total Features', value: dashboardData?.metrics?.totalFeatures?.value || '-', cardBg: 'bg-[#fff5f6]' },
    
    { title: 'Popular Plan', value: dashboardData?.metrics?.popularPlan?.value || '-', cardBg: 'bg-[#fffaf6]' },
    { title: 'Support Tickets', value: dashboardData?.metrics?.supportTickets?.value , cardBg: 'bg-[#f4faff]' },
    { title: 'Recent Tenants', value: dashboardData?.metrics?.recentTenantsAdded?.value || '-', cardBg: 'bg-[#f8fdf4]' },
    { title: 'Recent Payments', value: dashboardData?.metrics?.recentPayments?.value || '-', cardBg: 'bg-[#f4fdff]' },
    { title: 'Total Users', value: dashboardData?.metrics?.totalUsers?.value || '-', cardBg: 'bg-[#fffdf6]' },
  ];

  return (
    <div className="space-y-6 bg-[#f8f9fc] min-h-screen p-2 -m-6 sm:m-0 sm:p-0 sm:bg-transparent">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-3 mt-3 sm:mt-0">
          <div className="text-xs text-slate-500 font-medium">
            {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* METRICS GRID (2 ROWS OF 5) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className={`${m.cardBg} rounded-xl p-4 border border-slate-100/50 shadow-sm flex flex-col justify-between h-28`}>
             
             
             <div>
                <div className="text-lg font-bold text-slate-800 tracking-tight">{m.value}</div>
                <div className="text-[12px] text-slate-500 font-medium mt-0.5">{m.title}</div>
             </div>
          </div>
        ))}
      </div>

      {/* TWO COLUMN TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tenants */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Tenants</h3>
            <Link to="/superadmin/tenants" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  <th className="py-3 font-semibold">Tenant Name</th>
                  <th className="py-3 font-semibold">Plan</th>
                  <th className="py-3 font-semibold">Status</th>
                  <th className="py-3 font-semibold text-right pr-4">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                {dashboardData?.recentTenants?.map((tenant, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-slate-800">{tenant.name}</td>
                    <td className="py-3">{tenant.planName}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tenant.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-800 font-semibold text-right pr-4">₹ {tenant.mrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Plans */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-800">Active Plans</h3>
            <Link to="/superadmin/plans" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  <th className="py-3 font-semibold">Plan Name</th>
                  <th className="py-3 font-semibold">Billing</th>
                  <th className="py-3 font-semibold text-center">Tenants</th>
                  <th className="py-3 font-semibold text-right pr-4">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                {dashboardData?.activePlans?.map((plan, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-bold text-slate-800">{plan.name}</td>
                    <td className="py-3">{plan.billingCycle}</td>
                    <td className="py-3 text-center">{plan.activeTenantsCount}</td>
                    <td className="py-3 text-slate-800 font-semibold text-right pr-4">${plan.price}</td>
                  </tr>
                ))}
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
