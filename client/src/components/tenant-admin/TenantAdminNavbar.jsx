import React from 'react';

export default function TenantAdminNavbar() {
  return (
    <div className="flex items-center justify-between h-[60px] px-6 bg-black text-white z-10 shrink-0">
      <div className="text-xl font-bold tracking-tight">TeamCore</div>
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center font-semibold text-[13px]">
          AD
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Admin T C</span>
          <span className="text-[11px] text-gray-400">Admin</span>
        </div>
        <i className="fas fa-chevron-down text-[10px] text-gray-400 ml-1"></i>
      </div>
    </div>
  );
}
