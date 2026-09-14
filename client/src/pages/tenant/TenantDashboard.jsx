import React from 'react';

export default function TenantDashboard() {
  // Hardcoded mock data based on the wireframe
  const mockTenant = "Acme Technologies";
  const currentPlan = "Pro";
  const billingCycle = "Monthly";
  const nextPaymentAmount = "₹2,499";
  const nextPaymentDate = "Oct 14, 2026";
  const totalPaid = "₹14,994";
  const paymentsCount = "6 payments";
  const adminsCount = "3";
  const adminStatus = "Active";

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header section with Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-12">
        <div>
          <h1 className="text-[28px] font-bold text-[#141824] tracking-tight leading-tight">
            Projects Dashboard
          </h1>
          <p className="mt-1 text-[15px] text-gray-500 font-medium">
            Here's what's going on at your business right now
          </p>
        </div>
        <div className="mt-4 sm:mt-0 relative">
          <div className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-1.5 shadow-sm cursor-pointer">
            <i className="fa-regular fa-calendar text-gray-400 mr-2 text-sm"></i>
            <span className="text-sm text-gray-700 font-medium">Mar 1, 2022</span>
          </div>
        </div>
      </div>

      {/* 4 Stat Items Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        
        {/* Stat 1 */}
        <div className="flex items-start">
          <div className="text-blue-600 mr-3 mt-1">
            <i className="fa-solid fa-table-cells-large text-3xl"></i>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#141824]">32</span>
              <span className="text-lg text-gray-600 font-medium">Projects</span>
            </div>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Awaiting processing</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex items-start">
          <div className="text-green-600 mr-3 mt-1">
            <i className="fa-solid fa-user-group text-3xl"></i>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#141824]">94</span>
              <span className="text-lg text-gray-600 font-medium">Members</span>
            </div>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Working hard</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex items-start">
          <div className="text-orange-500 mr-3 mt-1">
            <i className="fa-solid fa-file-invoice text-3xl"></i>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#141824]">23</span>
              <span className="text-lg text-gray-600 font-medium">Invoices</span>
            </div>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Soon to be cleared</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex items-start">
          <div className="text-red-500 mr-3 mt-1">
            <i className="fa-solid fa-arrow-rotate-left text-3xl"></i>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-[#141824]">3</span>
              <span className="text-lg text-gray-600 font-medium">Refunds</span>
            </div>
            <p className="text-[13px] text-gray-400 font-medium mt-0.5">Fresh start</p>
          </div>
        </div>

      </div>

      {/* Mock Chart & Feature Card Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mock Chart Area */}
        <div>
          <h2 className="text-[22px] font-bold text-[#141824] tracking-tight">
            Project: zero Roadmap
          </h2>
          <p className="text-[15px] text-gray-500 font-medium mt-1 mb-6">Phase 2 is now ongoing</p>
          
          <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm min-h-[250px] flex items-center justify-center text-gray-300">
            [Chart Area Placeholder]
          </div>
        </div>

        {/* Card Area */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          <div className="p-8">
            <div className="inline-block bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded mb-4 tracking-wider">
              COMING SOON <i className="fa-solid fa-lightbulb ml-1"></i>
            </div>
            <h2 className="text-[22px] font-bold text-[#141824] mb-4">
              Early bird gets the warm leads!
            </h2>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-sm mb-12">
              Teamo Dashboard is coming to market soon for fulfilling your every related needs.
            </p>
            <p className="text-[13px] font-medium text-gray-500">
              Follow <span className="text-blue-500 cursor-pointer hover:underline">ThemeWagon</span> at Bootstrap Marketplace for updates.
            </p>
          </div>
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-full overflow-hidden pointer-events-none">
            <div className="absolute -right-10 top-10 w-64 h-64 bg-blue-50 rounded-full opacity-60 blur-3xl"></div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
