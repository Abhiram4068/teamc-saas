import React from 'react';
import { Outlet } from 'react-router-dom';
import CheckoutNavbar from '../components/common/CheckoutNavbar';
import CheckoutFooter from '../components/common/CheckoutFooter';

export default function TenantCheckoutLayout() {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans antialiased selection:bg-brand-500 selection:text-white min-h-screen flex flex-col justify-between">
      <CheckoutNavbar />
      <Outlet />
      <CheckoutFooter />
    </div>
  );
}
