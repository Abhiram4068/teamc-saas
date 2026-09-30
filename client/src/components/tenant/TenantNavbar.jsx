import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function TenantNavbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
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
          Teamo Tenant Portal <span className="text-xs font-medium text-gray-600"> Billing Admin</span>
        </h1>
      </div>

      <div className="flex items-center justify-end space-x-4 w-1/3">

        {/* User Profile Info & Avatar */}
        <div className="flex items-center gap-3 ml-2">
          {user && (
            <div className="flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {user.firstName} {user.lastName}
              </span>
              <span className="text-[10px] font-medium text-slate-500 leading-tight">
                {user.email}
              </span>
            </div>
          )}
          <div className="w-9 h-9 rounded-full bg-[#1A1E29] text-white flex items-center justify-center font-bold text-sm shadow-sm select-none cursor-pointer ">
            {getInitials()}
          </div>
        </div>
      </div>
    </header>
  );
}
