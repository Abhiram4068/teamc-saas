import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';


export default function TenantSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    clearRole();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { to: '/tenant/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
      ],
    },
    {
      title: 'Subscription',
      items: [
        { to: '/tenant/my-plan', label: 'My Plan', icon: 'fa-solid fa-crown' },
        { to: '/tenant/plans', label: 'Explore Plans', icon: 'fa-solid fa-compass' },
        { to: '/tenant/history', label: 'Payment History', icon: 'fa-solid fa-clock-rotate-left' },
        { to: '/tenant/billing', label: 'Billing Information', icon: 'fa-solid fa-file-invoice-dollar' },
        { to: '/tenant/invoices', label: 'Invoices', icon: 'fa-solid fa-receipt' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { to: '/tenant/administrators', label: 'Administrators', icon: 'fa-solid fa-users-gear' },
        { to: '/tenant/profile', label: 'Organization Profile', icon: 'fa-solid fa-building' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/tenant/account', label: 'Account Settings', icon: 'fa-solid fa-user-cog' },
        { to: '/tenant/security', label: 'Security', icon: 'fa-solid fa-shield-halved' },
        { to: '/tenant/notifications', label: 'Notifications', icon: 'fa-solid fa-bell' },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#1A1E29] text-white flex-shrink-0 border-r border-gray-200 flex flex-col pt-14 pb-4 select-none h-screen">
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-6">
        {navGroups.map((group, index) => (
          <div key={index}>
            <div className="text-[11px] font-bold text-gray-200 uppercase tracking-wider mb-2 ml-2">
              {group.title}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center py-2 px-3 rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'text-white font-semibold '
                        : 'text-white hover:text-white font-medium'
                    }`
                  }
                >
                  <i className={`${item.icon} w-5 text-center text-[13px] mr-2 text-gray-400`}></i>
                  <span className="text-[12px] text-gray-400">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">
            Help & Support
          </div>
          <NavLink
            to="/tenant/support"
            className={({ isActive }) =>
              `flex items-center py-2 px-3 rounded-md transition-colors duration-200 ${
                isActive
                  ? 'text-white font-semibold bg-white/10'
                  : 'text-blue-100 hover:text-white hover:bg-white/5 font-medium'
              }`
            }
          >
            <i className={`fa-solid fa-circle-question w-5 text-center text-[13px] mr-2`}></i>
            <span className="text-[13px]">Help & Support</span>
          </NavLink>
        </div>
      </div>

      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-2 px-3 rounded-md transition-colors duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium"
        >
          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-[13px] mr-2"></i>
          <span className="text-[13px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
