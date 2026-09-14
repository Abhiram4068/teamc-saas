import React from 'react';
import { Outlet } from 'react-router-dom';
import TenantSidebar from '../components/tenant/TenantSidebar';
import TenantNavbar from '../components/tenant/TenantNavbar';

export default function TenantLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      <TenantSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TenantNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
