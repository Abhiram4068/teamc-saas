import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';

export default function TenantAdminNavbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const companyName = user?.companyName || 'Teamo';
  const fullName = user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'Admin';
  const initials = user?.initials || 'A';

  return (
    <div className="flex items-center justify-between h-[60px] px-6 bg-black text-white z-10 shrink-0">
      <div className="text-xl font-bold tracking-tight">{companyName} </div>
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-[13px]">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">{fullName}</span>
          <span className="text-[11px] text-gray-400">Admin</span>
        </div>
        <i className="fas fa-chevron-down text-[10px] text-gray-400 ml-1"></i>
      </div>
    </div>
  );
}
