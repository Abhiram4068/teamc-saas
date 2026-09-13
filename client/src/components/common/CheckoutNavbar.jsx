import React from 'react';
import { Link } from 'react-router-dom';
import { getToken, parseJwt } from '../../utils/tokenStorage';

export default function CheckoutNavbar() {
  const token = getToken();
  const decoded = parseJwt(token);
  
  // Attempt to extract company name from the custom JWT claim
  const companyName = decoded?.companyName 
    || decoded?.CompanyName 
    || 'your company';

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
              <Link to="/price" className="text-[#091E42] hover:text-[#091E42] font-semibold transition-colors">
                  Change plan
              </Link>
              <div className="flex items-center space-x-1.5 hidden sm:flex">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
              </div>
          </div>
      </div>
    </header>
  );
}
