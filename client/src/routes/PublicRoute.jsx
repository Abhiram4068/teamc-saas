import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole, parseJwt } from '../utils/tokenStorage';

export default function PublicRoute() {
  const token = getToken();

  if (token) {
    let userRole = getRole();
    if (!userRole) {
      const decoded = parseJwt(token);
      const roleClaim = decoded?.role || decoded?.Role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
      userRole = typeof roleClaim === 'string' ? parseInt(roleClaim, 10) : roleClaim;
    }

    if (userRole === 3) {
      return <Navigate to="/tenant-admin/dashboard" replace />;
    }
    // You can add other role checks here if needed, 
    // but the request was specifically for userRole === 6
  }

  return <Outlet />;
}
