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

    if (userRole === 1) {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (userRole === 2) {
      return <Navigate to="/tenant/dashboard" replace />;
    } else if (userRole === 3) {
      return <Navigate to="/tenant-admin/dashboard" replace />;
    } else if (userRole === 4 || userRole === 5 || userRole === 6) {
      return <Navigate to="/emp/dashboard" replace />;
    }
  }

  return <Outlet />;
}
