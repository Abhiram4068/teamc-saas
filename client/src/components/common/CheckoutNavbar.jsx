import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function CheckoutNavbar() {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('your company');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await authApi.getCurrentUser();
      if (currentUser?.companyName) {
        setCompanyName(currentUser.companyName);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      {/* Top narrow banner */}
      <div className="bg-[#091E42] text-white text-xs font-medium text-center py-1.5">
        Teamo Checkout Page
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
              <span className="text-lg font-bold text-slate-900 tracking-tight">Teamo</span>
          </Link>
          
          <div className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <span>Upgrade <strong className="text-slate-900 font-semibold">Workspace</strong> to Teamo Pro for {companyName}</span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-500 font-medium">
              <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline transition-colors">
                  Change plan
              </button>
          </div>
      </div>
    </header>
  );
}
