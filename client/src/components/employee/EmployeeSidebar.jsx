import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { getRole } from '../../utils/tokenStorage';
import { FeatureGate } from '../../features/FeatureGate';
import { FEATURES } from '../../features/featureCodes';

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLeavesOpen, setIsLeavesOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `w-full h-12 flex items-center px-6 text-xs gap-4 cursor-pointer transition-all duration-200 no-underline ${
      isActive
        ? 'bg-slate-100 text-slate-900 border-l-[3px] border-slate-900 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-800 '
    }`;

  const parsedRole = getRole();

  return (
    <div className="w-[240px] shrink-0 bg-slate-900 flex flex-col pt-6 relative min-h-[calc(100vh-60px)]">
 
      <div className="flex flex-col w-full divide-y divide-white/10 border-t border-b border-white/10">
        <NavLink to="/emp/dashboard" className={linkClass}>
          <i className="fas fa-gauge-high text-base w-5 text-center"></i>
          <span>Overview</span>
        </NavLink>
        
        <NavLink to="/emp/profile" className={linkClass}>
          <i className="fas fa-home text-base w-5 text-center"></i>
          <span>Home</span>
        </NavLink>

        {(parsedRole === 4) ? (
          <NavLink to="/emp/employees" className={linkClass}>
            <i className="fas fa-users text-base w-5 text-center"></i>
            <span>Employees</span>
          </NavLink>
        ) : (parsedRole ===5) ? (
          <NavLink to="/emp/employees" className={linkClass}>
            <i className="fas fa-users text-base w-5 text-center"></i>
            <span>Team</span>
          </NavLink>
        ) : (null)}

        {parsedRole === 6 && (
          <FeatureGate feature={FEATURES.LEAVES_MODULE}>
            <NavLink to="/emp/leaves" className={linkClass}>
              <i className="fas fa-calendar-alt text-base w-5 text-center"></i>
              <span>Leaves</span>
            </NavLink>
          </FeatureGate>
        )}

        {parsedRole === 5 && (
          <FeatureGate feature={FEATURES.LEAVES_MODULE}>
            <div className="flex flex-col">
              <div 
                className="w-full h-12 flex items-center px-6 text-xs gap-4 cursor-pointer transition-all duration-200 no-underline text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setIsLeavesOpen(!isLeavesOpen)}
              >
                <i className="fas fa-calendar-alt text-base w-5 text-center"></i>
                <span>Leaves</span>
                <i className={`fas fa-chevron-down ml-auto transition-transform ${isLeavesOpen ? 'rotate-180' : ''}`}></i>
              </div>
              
              {isLeavesOpen && (
                <div className="flex flex-col bg-slate-800/50">
                  <NavLink to="/emp/leaves" className={linkClass}>
                    <i className="fas fa-user-clock text-base w-5 text-center pl-2"></i>
                    <span>My Leaves</span>
                  </NavLink>
                  <NavLink to="/emp/approvals" className={linkClass}>
                    <i className="fas fa-check-double text-base w-5 text-center pl-2"></i>
                    <span>Leaves to be Approved</span>
                  </NavLink>
                </div>
              )}
            </div>
          </FeatureGate>
        )}

        {parsedRole === 4 && (
          <FeatureGate feature={FEATURES.LEAVES_MODULE}>
            <div className="flex flex-col">
              <div 
                className="w-full h-12 flex items-center px-6 text-xs gap-4 cursor-pointer transition-all duration-200 no-underline text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => setIsLeavesOpen(!isLeavesOpen)}
              >
                <i className="fas fa-calendar-alt text-base w-5 text-center"></i>
                <span>Leaves</span>
                <i className={`fas fa-chevron-down ml-auto transition-transform ${isLeavesOpen ? 'rotate-180' : ''}`}></i>
              </div>
              
              {isLeavesOpen && (
                <div className="flex flex-col bg-slate-800/50">
                  <NavLink to="/emp/leaves" end className={linkClass}>
                    <i className="fas fa-user-clock text-base w-5 text-center pl-2"></i>
                    <span>My Leaves</span>
                  </NavLink>
                  <NavLink to="/emp/leaves/approvals" className={linkClass}>
                    <i className="fas fa-check-double text-base w-5 text-center pl-2"></i>
                    <span>Leaves to be Approved</span>
                  </NavLink>
                  <NavLink to="/emp/leaves/manage" className={linkClass}>
                    <i className="fas fa-users-cog text-base w-5 text-center pl-2"></i>
                    <span>Manage Employee Leaves</span>
                  </NavLink>
                </div>
              )}
            </div>
          </FeatureGate>
        )}
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
