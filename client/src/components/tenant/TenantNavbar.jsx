import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function TenantNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Get initials from user or default to "T"
  const getInitials = () => {
    if (!user || (!user.firstName && !user.lastName)) return 'T';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center w-1/3">
        {/* Placeholder for left side if needed, currently logo is public */}
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">
          Teamo Tenant User Portal
        </h1>
      </div>

      <div className="flex-1 flex justify-center w-1/3">
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fa-solid fa-search text-gray-400 text-sm"></i>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search..."
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 w-1/3">
        {/* Add Admin Button */}
        <button 
          onClick={() => navigate('/tenant/add-admin')}
          className="hidden sm:flex items-center px-3 py-1.5 bg-brand-50 text-brand-600 border border-brand-200 hover:bg-brand-100 rounded-md text-sm font-semibold transition-colors shadow-sm"
        >
          <i className="fa-solid fa-user-plus mr-2"></i>
          Add Admin
        </button>

        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <i className="fa-regular fa-sun text-lg"></i>
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <i className="fa-regular fa-bell text-lg"></i>
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
          <i className="fa-solid fa-border-all text-lg"></i>
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center ml-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm select-none cursor-pointer hover:bg-brand-700 transition-colors">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}
