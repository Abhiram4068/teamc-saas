import React from 'react';

const TicketNavbar = ({ userProfile }) => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center text-slate-900 font-bold text-lg">
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3 text-slate-600">
        <div className="flex flex-col items-end mr-2">
          <span className="text-sm font-semibold text-slate-800">
            {userProfile?.firstName} {userProfile?.lastName}
          </span>
          <span className="text-[10px] text-slate-500">{userProfile?.email}</span>
        </div>
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
          {userProfile?.initials || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TicketNavbar;
