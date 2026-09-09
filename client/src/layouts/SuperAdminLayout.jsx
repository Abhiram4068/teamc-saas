import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from '../components/superadmin/SuperAdminNavbar';
import SuperAdminSidebar from '../components/superadmin/SuperAdminSidebar';

export default function SuperAdminLayout() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f5f7fa] text-[#31374a]">
      {/* TOP NAVBAR */}
      <SuperAdminNavbar />

      {/* BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <SuperAdminSidebar />

        {/* MAIN ROUTE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
