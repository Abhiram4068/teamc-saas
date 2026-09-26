import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { removeToken, removeRefreshToken } from '../../utils/tokenStorage';


export default function TenantSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    removeRefreshToken();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', to: '/tenant/dashboard', icon: 'fa-solid fa-house' },
    {
      label: 'People',
      icon: 'fa-solid fa-user-group',
      subItems: [
        { label: 'Admins', to: '/tenant/administrators' },
        { label: 'Users', to: '/tenant/users' },
        { label: 'Add Admins', to: '/tenant/add-admin' },
      ],
    },
    {
      label: 'Subscriptions',
      icon: 'fa-solid fa-credit-card',
      subItems: [
        { label: 'Billings', to: '/tenant/billing' },
        { label: 'Change Plan', to: '/tenant/plans' },
        { label: 'Subscription Summary', to: '/tenant/subscription-summary' },
        { label: 'Invoices', to: '/tenant/invoices' },
        { label: 'Payments', to: '/tenant/payments' },
      ],
    },
    {
      label: 'Support',
      icon: 'fa-solid fa-headset',
      subItems: [
        { label: 'Manage Tickets', to: '/tenant/support-tickets' },
        { label: 'Contact Support', to: '/tenant/contact-support' },
      ],
    }
  ];

  return (
    <aside className="w-56 bg-[#1A1E29] text-white flex-shrink-0 border-r border-gray-200 flex flex-col pt-8 pb-4 select-none h-screen">
      <div className="px-4 mb-6">
        <NavLink 
          to="/"
          className="flex items-center py-1.5 px-3 text-gray-400 hover:text-white transition-colors text-[12px] font-medium rounded-md hover:bg-white/5"
        >
          <i className="fa-solid fa-arrow-left mr-3 text-[11px]"></i>
          Back to Teamo
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto px-4 custom-scrollbar space-y-6">
        {navItems.map((item, index) => (
          <div key={index} className="mb-2">
            {item.to ? (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center py-1.5 px-3 transition-all duration-200 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-gray-400 hover:text-white font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i className={`${item.icon} w-5 text-center text-[13px] mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`}></i>
                    <span className="text-[13px]">{item.label}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <div className="flex items-center py-1.5 px-3 text-gray-400 font-medium select-none cursor-default hover:text-white transition-colors">
                <i className={`${item.icon} w-5 text-center text-[13px] mr-3`}></i>
                <span className="text-[13px]">{item.label}</span>
              </div>
            )}
            
            {item.subItems && (
              <div className="flex flex-col space-y-1 ml-11 mt-1 mb-2">
                {item.subItems.map((sub) => (
                  <NavLink
                    key={sub.label}
                    to={sub.to}
                    className={({ isActive }) =>
                      `block py-1 transition-all duration-200 text-[12px] ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-gray-400 hover:text-white font-medium'
                      }`
                    }
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 mt-2 mb-2">
        <div className="h-px bg-gray-700/50 mb-2 mx-1"></div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full py-1.5 px-3 rounded-md transition-colors duration-200 text-gray-400 hover:bg-white/5 hover:text-white font-medium"
        >
          <i className="fa-solid fa-arrow-right-from-bracket w-5 text-center text-[13px] mr-3"></i>
          <span className="text-[13px]">Logout</span>
        </button>
      </div>
    </aside>
  );
}
