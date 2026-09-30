import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import TicketSidebar from './TicketSidebar';
import TicketNavbar from './TicketNavbar';
import { authApi } from '../../api/authApi';
import { getRole } from '../../utils/tokenStorage';

const TicketLayout = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(4); // Default to employee

  useEffect(() => {
    document.title = 'Teamo Support';
    
    const loadProfile = async () => {
      const role = getRole();
      if (role) {
        setUserRole(role);
      }

      const profile = await authApi.getCurrentUser();
      if (profile) {
        setUserProfile(profile);
      }
    };
    loadProfile();
  }, []);

  return (
    <div className="bg-[#f8fafc] text-slate-700 flex h-screen overflow-hidden text-xs font-['Inter']">
      <TicketSidebar userRole={userRole} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TicketNavbar userProfile={userProfile} />
        <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TicketLayout;
