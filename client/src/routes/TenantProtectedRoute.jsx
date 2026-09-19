import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole } from '../utils/tokenStorage';

export default function TenantProtectedRoute() {
  const token = getToken();
  const role = getRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === 2) {
    return <Outlet />;
  } else if (role === 1) {
    return <Navigate to="/superadmin/dashboard" replace />;
  } else if (role === 3) {
    return <Navigate to="/tenant-admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;

  return <Outlet />;
}
