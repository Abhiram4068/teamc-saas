import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import { getRole } from '../../utils/tokenStorage';

export default function EmployeeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await employeeApi.getDashboardSummary();
        if (response.data && response.data.data) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const parsedRole = getRole();
  return (
    <div className="animate-fade-in ">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 flex justify-between items-center shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">Employee Workspace</h1>
          <p className="text-[13px] text-gray-500">Welcome to your dashboard.</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
          <i className="far fa-calendar text-gray-400"></i>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-[11px] font-bold text-gray-500 tracking-wide">EMPLOYEE DASHBOARD</div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500 mb-6">Loading dashboard data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {dashboardData?.totalEmployees !== null && dashboardData?.totalEmployees !== undefined && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wide text-gray-500 mb-2">TOTAL EMPLOYEES</span>
              <span className="text-3xl font-bold text-gray-900">{dashboardData.totalEmployees}</span>
            </div>
          )}
          {dashboardData?.totalManagers !== null && dashboardData?.totalManagers !== undefined && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wide text-gray-500 mb-2">TOTAL MANAGERS</span>
              <span className="text-3xl font-bold text-gray-900">{dashboardData.totalManagers}</span>
            </div>
          )}
          {dashboardData?.reportingEmployees !== null && dashboardData?.reportingEmployees !== undefined && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold tracking-wide text-gray-500 mb-2">MY TEAM (DIRECT REPORTS)</span>
              <span className="text-3xl font-bold text-gray-900">{dashboardData.reportingEmployees}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="bg-[#1a2234] text-white rounded-lg p-6 flex flex-col justify-between h-[180px]">
          <div className="flex items-end gap-10">
            <div className="flex flex-col border-r border-[#2a3447] pr-10">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                TOTAL LEAVES
              </span>
              <span className="text-3xl font-bold">12</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> APPROVED
              </span>
              <span className="text-3xl font-bold">8</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span> PENDING
              </span>
              <span className="text-3xl font-bold">4</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#2a3447] text-[11px] text-gray-400">
            <span>Showing your leave status.</span>
            <button className="text-brand-400 font-semibold text-[11px] hover:text-brand-300 transition bg-transparent border-none cursor-pointer">
              REQUEST LEAVE &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 flex flex-col justify-between shadow-sm h-[180px] relative border border-gray-100">
          <div className="absolute top-5 right-5 bg-gray-50 w-9 h-9 rounded-md flex items-center justify-center text-gray-400">
            <i className="far fa-clock"></i>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wide text-gray-500 mb-2 flex items-center gap-1.5 uppercase">
              HOURS LOGGED
            </span>
            <div className="text-3xl font-bold text-gray-900 mt-2">142h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
