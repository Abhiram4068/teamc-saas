import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TenantAdminRegisterUser() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <h1 className="text-[22px] font-bold text-gray-900 mb-6">Register New User</h1>

      <div className="bg-white rounded-lg p-[30px] shadow-sm max-w-[900px] border border-gray-100">
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-800">Employee Details</h2>
          <p className="text-xs text-gray-500 mt-1">Enter the required information to provision a new account.</p>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">First Name</label>
              <input 
                type="text" 
                placeholder="e.g. John" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Last Name</label>
              <input 
                type="text" 
                placeholder="e.g. Doe" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Phone Number</label>
              <input 
                type="text" 
                placeholder="e.g. 6731000363" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Date of Joining</label>
              <input 
                type="text" 
                placeholder="dd-mm-yyyy" 
                className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 transition placeholder-gray-300"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">System Role</label>
              <select className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 bg-white">
                <option>Employee</option>
                <option>Manager</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-600 tracking-wide uppercase mb-2">Reporting Manager</label>
              <select className="w-full p-2.5 border border-gray-200 rounded-md text-xs text-gray-700 outline-none focus:border-brand-500 bg-white">
                <option>Select a Manager</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              type="reset" 
              className="bg-white border border-gray-200 text-gray-500 py-2 px-4 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:bg-gray-50 transition"
            >
              <i className="fas fa-eraser text-[10px]"></i> Clear
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/tenant-admin/dashboard')}
              className="bg-white border border-gray-200 text-gray-800 py-2 px-4 rounded-md text-xs font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-brand-600 text-white border-none py-2 px-4 rounded-md text-xs font-semibold cursor-pointer flex items-center gap-2 hover:bg-brand-700 transition"
            >
              <i className="fas fa-user-check"></i> Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
