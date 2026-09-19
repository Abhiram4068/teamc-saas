import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TenantAdminEmployees() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      {/* Header Card */}
      <div className="bg-white rounded-lg p-6 flex justify-between items-center shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">User Profiles</h1>
          <p className="text-[13px] text-gray-500">Manage user credentials, operational roles, and access statuses across the system.</p>
        </div>
        <button 
          onClick={() => navigate('/tenant-admin/dashboard')}
          className="bg-white border border-gray-200 text-gray-700 py-2 px-4 rounded-md text-[13px] font-semibold cursor-pointer flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <i className="fas fa-arrow-left"></i> Dashboard Overview
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 px-5 flex justify-between items-center border-b border-gray-100">
          <div className="relative w-[600px]">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
            <input 
              type="text" 
              placeholder="Search by name, email or employee code..."
              className="w-full py-2 px-3 pl-8 border border-gray-100 bg-gray-50 rounded-md text-xs outline-none focus:border-brand-500 transition"
            />
          </div>
          <div className="flex items-center gap-4">
            <select className="py-2 px-3 border border-gray-100 bg-white rounded-md text-xs text-gray-700 outline-none min-w-[120px] focus:border-brand-500">
              <option>All Roles</option>
            </select>
            <span className="text-[11px] text-gray-400">Page 1 of 1</span>
            <div className="flex gap-1 text-gray-300 text-[10px]">
              <i className="fas fa-chevron-left cursor-pointer hover:text-gray-500"></i>
              <i className="fas fa-chevron-right cursor-pointer hover:text-gray-500"></i>
            </div>
            <span className="text-[11px] text-gray-500">Showing <b>8</b> of <b>8</b> results</span>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">EMP CODE <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">NAME <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">EMAIL ADDRESS <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">JOINED <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">MANAGER <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">STATUS <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">ROLE <i className="fas fa-sort text-[8px] ml-1"></i></th>
              <th className="py-3 px-5 text-[10px] font-bold text-gray-500 tracking-wide border-b border-gray-100">ACTION</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-xs">
            {/* Hardcoded sample data from template */}
            {[
              { id: 1057, name: 'Abhiiiram s', email: 'abhiiram12@gmail.com', date: '9/6/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1056, name: 'John Doe', email: 'john.doecompany@ss.coom', date: '8/19/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1055, name: 'John Doe', email: 'john.doecompany@ss', date: '8/19/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1054, name: 'John Doe', email: 'john.doecompany@s', date: '8/19/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1053, name: 'John Doe', email: 'john.doe@company', date: '8/19/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1052, name: 'John Doe', email: 'john.doe@company.com', date: '8/19/2026', manager: '', status: 'Active', role: 'MANAGER' },
              { id: 1049, name: 'Abyram S', email: 'abyram394@gmail.com', date: '9/2/2026', manager: 'Abhiram S', status: 'Active', role: 'EMPLOYEE', isEmployee: true },
            ].map((user, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0">
                <td className="py-3.5 px-5 text-gray-400">{user.id}</td>
                <td className="py-3.5 px-5 font-semibold text-gray-900">{user.name}</td>
                <td className="py-3.5 px-5">{user.email}</td>
                <td className="py-3.5 px-5 text-gray-400">{user.date}</td>
                <td className="py-3.5 px-5">{user.manager}</td>
                <td className="py-3.5 px-5">
                  <span className="text-green-600 font-semibold">{user.status}</span>
                </td>
                <td className="py-3.5 px-5">
                  <span className={`font-bold text-[11px] ${user.isEmployee ? 'text-brand-600' : 'text-brand-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <button className="bg-green-50 text-green-700 border border-green-200 py-1.5 px-3 rounded text-[11px] font-semibold hover:bg-green-100 transition">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
