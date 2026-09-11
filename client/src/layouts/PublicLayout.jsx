import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/public/PublicNavbar';
import PublicFooter from '../components/public/PublicFooter';

export default function PublicLayout() {
  return (
    <div
      className="flex flex-col min-h-screen bg-white text-[#172B4D] font-jakarta antialiased selection:bg-blue-100 selection:text-brand-600"
      style={{ fontFamily: '"Plus Jakarta Sans", Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* NAVBAR */}
      <PublicNavbar />

      {/* PAGE CONTENT VIA OUTLET */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
