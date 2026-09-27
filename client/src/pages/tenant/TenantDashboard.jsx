import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { useToast } from '../../utils/Toast';

export default function TenantDashboard() {
  const [data, setData] = useState({
    totalAdmins: 0,
    currentActivePlan: 'Loading...',
    nextPaymentDate: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardApi.getTenantDashboard();
        if (res?.data?.success) {
          setData(res.data.data);
        } else if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        showToast("Failed to fetch dashboard data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header section with Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-12">
        <div>
          <h1 className="text-xl font-semibold text-[#141824] tracking-tight leading-tight">
            Dashboard
          </h1>
        </div>
      </div>

      {/* 3 Stat Items Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-16">
        
        {/* Stat 1 */}
        <div className="flex items-start">
          <div className="text-blue-600 mr-3 mt-1">
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-[#141824]">{data.totalAdmins}</span>
              <span className="text-sm text-gray-600 font-medium">Admins</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Total active administrators</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex items-start">
          <div className="text-green-600 mr-3 mt-1">
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-[#141824]">{data.currentActivePlan}</span>
              <span className="text-sm text-gray-600 font-medium">Plan</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Currently active plan</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex items-start">
          <div className="text-orange-500 mr-3 mt-1">
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-[#141824]">{data.nextPaymentDate}</span>
              <span className="text-sm text-gray-600 font-medium">Next Payment</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Scheduled billing date</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex items-start">
          <div className="text-orange-500 mr-3 mt-1">
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-[#141824]">5</span>
              <span className="text-sm text-gray-600 font-medium">Total Tickets</span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Total Tickets to be Solved</p>
          </div>
        </div>

      </div>
    </div>
  );
}
