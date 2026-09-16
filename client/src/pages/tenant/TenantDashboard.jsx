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
          <h1 className="text-[28px] font-semibold text-[#141824] tracking-tight leading-tight">
            Tenant Dashboard
          </h1>
        </div>
      </div>

      {/* 4 Stat Items Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        
        {/* Stat 1 */}
        <div className="flex items-start">
          <div className="text-blue-600 mr-3 mt-1">
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
        
        


      </div>
      
    </div>
  );
}
