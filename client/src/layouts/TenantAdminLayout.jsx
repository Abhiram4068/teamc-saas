import React from 'react';
import { Outlet } from 'react-router-dom';
import TenantAdminNavbar from '../components/tenant-admin/TenantAdminNavbar';
import TenantAdminSidebar from '../components/tenant-admin/TenantAdminSidebar';

export default function TenantAdminLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1f3f9] text-gray-800 font-sans">
      <TenantAdminNavbar />
      <div className="flex flex-1 overflow-hidden">
        <TenantAdminSidebar />
        <div className="flex-1 p-[30px_40px] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
