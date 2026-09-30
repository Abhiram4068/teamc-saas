import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeToken, removeRefreshToken } from '../../utils/tokenStorage';

export default function SuperAdminNavbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    removeRefreshToken();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-[#141824] text-slate-300 h-14 border-b border-slate-800 sticky top-0 z-50 flex items-center justify-between px-4">
      {/* Brand Logo & Search */}
      <div className="flex items-center space-x-6">
        <Link to="/superadmin/dashboard" className="flex items-center space-x-2">
          <div className="w-7 h-7 flex items-center justify-center font-black text-white text-sm">
            T
          </div>
          <span className="text-lg font-black tracking-tight text-white">Teamo Administrator Panel</span>
        </Link>

        {/* Search Input
        <div className="relative hidden sm:block w-72">
          <svg
            className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#1e2330] text-xs text-slate-200 placeholder-slate-400 rounded-md pl-9 pr-3 py-2 border border-slate-700/60 focus:outline-none focus:border-blue-500"
          />
        </div> */}
      </div>

      {/* Right Profile Controls */}
      <div className="flex items-center space-x-4 text-xs">

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white border border-slate-600 hover:border-blue-500 transition"
          >
            SA
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1e2330] border border-slate-700 rounded-md shadow-lg py-1 z-50 text-slate-200">
              <div className="px-4 py-2 border-b border-slate-700">
                <p className="font-bold text-white">Super Admin</p>
                <p className="text-[11px] text-slate-400">superadmin@teamc.com</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-slate-800 hover:text-red-300 transition flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
