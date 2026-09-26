import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole, parseJwt } from '../utils/tokenStorage';

export default function TenantAdminRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Support both direct getRole and fallback to token parsing
  let userRole = getRole();
  if (!userRole) {
    const decoded = parseJwt(token);
    const roleClaim = decoded?.role || decoded?.Role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    userRole = typeof roleClaim === 'string' ? parseInt(roleClaim, 10) : roleClaim;
  }

  if (userRole === 3) {
    return <Outlet />;
  } else if (userRole === 1) {
    return <Navigate to="/superadmin/dashboard" replace />;
  } else if (userRole === 2) {
    return <Navigate to="/tenant/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;

  return <Outlet />;
}
