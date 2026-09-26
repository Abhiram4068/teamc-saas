import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeNavbar from '../components/employee/EmployeeNavbar';
import EmployeeSidebar from '../components/employee/EmployeeSidebar';

export default function EmployeeLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f1f3f9] text-gray-800 font-sans">
      <EmployeeNavbar />
      <div className="flex flex-1 overflow-hidden">
        <EmployeeSidebar />
        <div className="flex-1 p-[30px_40px] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
