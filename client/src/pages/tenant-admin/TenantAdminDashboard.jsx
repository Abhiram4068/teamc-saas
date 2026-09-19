import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TenantAdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 flex justify-between items-center shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">System Control Console</h1>
          <p className="text-[13px] text-gray-500">Welcome back, Administrator.</p>
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
          <i className="far fa-calendar text-gray-400"></i>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-[11px] font-bold text-gray-500 tracking-wide">ADMINISTRATION DASHBOARD</div>
        <button 
          onClick={() => navigate('/tenant-admin/add-user')}
          className="bg-brand-600 text-white border-none py-2 px-4 rounded-md text-[13px] font-semibold cursor-pointer flex items-center gap-2 hover:bg-brand-700 transition"
        >
          <i className="fas fa-user-plus"></i> Register New User
        </button>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-5">
        <div className="bg-[#1a2234] text-white rounded-lg p-6 flex flex-col justify-between h-[180px]">
          <div className="flex items-end gap-10">
            <div className="flex flex-col border-r border-[#2a3447] pr-10">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                TOTAL USERS
              </span>
              <span className="text-3xl font-bold">8</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span> MANAGERS
              </span>
              <span className="text-3xl font-bold">7</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span> EMPLOYEES
              </span>
              <span className="text-3xl font-bold">1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wide text-[#8c9ba5] mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span> INACTIVE
              </span>
              <span className="text-3xl font-bold">0</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-[#2a3447] text-[11px] text-gray-400">
            <span>Showing all users.</span>
            <button 
              onClick={() => navigate('/tenant-admin/users')}
              className="text-brand-400 font-semibold text-[11px] hover:text-brand-300 transition bg-transparent border-none cursor-pointer"
            >
              VIEW ALL &rarr;
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-5 flex flex-col justify-between shadow-sm h-[180px] relative border border-gray-100">
          <div className="absolute top-5 right-5 bg-gray-50 w-9 h-9 rounded-md flex items-center justify-center text-gray-400">
            <i className="far fa-user"></i>
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wide text-gray-500 mb-2 flex items-center gap-1.5 uppercase">
              JOINEES THIS MONTH
            </span>
            <div className="text-3xl font-bold text-gray-900 mt-2">3</div>
          </div>
        </div>
      </div>
    </div>
  );
}
