import React from 'react';

export default function EmployeeProfile() {
  return (
    <div className="animate-fade-in relative">
      <div className="bg-white rounded-lg p-6 flex justify-between items-center shadow-sm mb-6 border border-gray-100">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1">My Profile</h1>
          <p className="text-[13px] text-gray-500">View and manage your personal and professional details.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-[30px] shadow-sm max-w-[900px] border border-gray-100">
        <div className="text-center py-10 text-gray-500">
          <i className="fas fa-tools text-4xl mb-4 text-brand-300"></i>
          <p>Profile view is under construction.</p>
        </div>
      </div>
    </div>
  );
}
