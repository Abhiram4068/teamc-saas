import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, parseJwt } from '../utils/tokenStorage';

export default function SuperAdminRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = parseJwt(token);
  
  // Extract role claim (standard 'role' or Microsoft identity claim URI)
  const roleClaim = decoded?.role || decoded?.Role || decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
  const userRole = typeof roleClaim === 'string' ? parseInt(roleClaim, 10) : roleClaim;

  if (userRole !== 1) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
