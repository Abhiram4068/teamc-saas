import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function TenantAdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `w-full h-16 flex flex-col items-center justify-center text-[10px] gap-1.5 cursor-pointer transition-all duration-200 no-underline ${
      isActive
        ? 'bg-[#0d121d] text-brand-500 border-l-[3px] border-brand-500'
        : 'text-[#888] hover:text-gray-300'
    }`;

  return (
    <div className="w-[70px] shrink-0 bg-black flex flex-col items-center pt-2.5 relative min-h-[calc(100vh-60px)]">
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#333] text-[#aaa] flex items-center justify-center mb-5 cursor-pointer text-xs">
        <i className="fas fa-chevron-right"></i>
      </div>
      
      <NavLink to="/tenant-admin/dashboard" className={linkClass}>
        <i className="fas fa-gauge-high text-base"></i>
        <span>Overview</span>
      </NavLink>
      
      <NavLink to="/tenant-admin/users" className={linkClass}>
        <i className="fas fa-users text-base"></i>
        <span>Users</span>
      </NavLink>
      
      <NavLink to="/tenant-admin/add-user" className={linkClass}>
        <i className="fas fa-user-plus text-base"></i>
        <span>Add User</span>
      </NavLink>
      
      <div 
        className="w-full h-16 flex flex-col items-center justify-center text-[10px] gap-1.5 cursor-pointer transition-all duration-200 mt-auto mb-5 text-red-500 hover:text-red-400"
        onClick={handleLogout}
      >
        <i className="fas fa-right-from-bracket text-base"></i>
        <span>Logout</span>
      </div>
    </div>
  );
}
