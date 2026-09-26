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
