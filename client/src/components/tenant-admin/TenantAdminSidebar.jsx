import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FeatureGate } from '../../features/FeatureGate';
import { FEATURES } from '../../features/featureCodes';

export default function TenantAdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `w-full h-12 flex items-center px-6 text-xs gap-4 cursor-pointer transition-all duration-200 no-underline ${
      isActive
        ? 'bg-[#0d121d] text-brand-500 border-l-[3px] border-brand-500 font-semibold'
        : 'text-[#888] hover:text-gray-300 border-l-[3px] border-transparent'
    }`;

  return (
    <div className="w-[240px] shrink-0 bg-black flex flex-col pt-6 relative min-h-[calc(100vh-60px)]">
 
      <div className="flex flex-col w-full divide-y divide-white/10 border-t border-b border-white/10">
        <NavLink to="/tenant-admin/dashboard" className={linkClass}>
          <i className="fas fa-gauge-high text-base w-5 text-center"></i>
          <span>Overview</span>
        </NavLink>
        
        <FeatureGate feature={FEATURES.EMPLOYEE_MANAGEMENT}>
          <NavLink to="/tenant-admin/users" className={linkClass}>
            <i className="fas fa-users text-base w-5 text-center"></i>
            <span>Users</span>
          </NavLink>
          
          <NavLink to="/tenant-admin/add-user" className={linkClass}>
            <i className="fas fa-user-plus text-base w-5 text-center"></i>
            <span>Add User</span>
          </NavLink>
        </FeatureGate>

        <FeatureGate feature={FEATURES.LEAVES_MODULE}>
          <NavLink to="/tenant-admin/leave-types" className={linkClass}>
            <i className="fas fa-calendar-alt text-base w-5 text-center"></i>
            <span>Leave Types</span>
          </NavLink>
        </FeatureGate>

        <FeatureGate feature={FEATURES.DAILY_WORK_REPORT}>
          <NavLink to="/tenant-admin/work-types" className={linkClass}>
            <i className="fas fa-clipboard-list text-base w-5 text-center"></i>
            <span>Work Report Types</span>
          </NavLink>
        </FeatureGate>
      </div>
      
      <div 
        className="w-full h-12 flex items-center px-6 text-xs gap-4 cursor-pointer transition-all duration-200 mt-auto text-red-500 hover:text-red-400 border-l-[3px] border-transparent"
        onClick={handleLogout}
      >
        <i className="fas fa-right-from-bracket text-base w-5 text-center"></i>
        <span>Logout</span>
      </div>

      <div className="w-full text-center pb-6 pt-2 text-[10px] text-gray-500 font-medium tracking-wide">
        A <span className="font-bold">TEAMO</span> product
      </div>
    </div>
  );
}
