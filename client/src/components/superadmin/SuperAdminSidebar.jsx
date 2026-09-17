import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SuperAdminSidebar() {
  const navItems = [
    {
      to: '/superadmin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      to: '/superadmin/tenants',
      label: 'Tenants',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0V5" />
        </svg>
      ),
    },
    {
      to: '/superadmin/plans',
      label: 'Plans',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      to: '/superadmin/features',
      label: 'Features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      to: '/superadmin/subscriptions',
      label: 'Subscriptions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      to: '/superadmin/payments',
      label: 'Payments',
      icon: (
        <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">
          ₹
        </span>
      ),
    },
  ];

  return (
    <aside className="w-[88px] bg-[#141824] text-slate-400 flex-shrink-0 border-r border-slate-800 flex flex-col items-center py-3 select-none">
      <div className="w-full space-y-1.5 overflow-y-auto px-2 max-h-[calc(100vh-4rem)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            title={item.label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2.5 px-1 rounded-md transition text-center ${isActive
                ? 'bg-[#2b3040] text-white font-semibold'
                : 'text-slate-300 hover:bg-[#2b3040] hover:text-white'
              }`
            }
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-[10px] leading-tight truncate w-full text-center font-medium">
              {item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}