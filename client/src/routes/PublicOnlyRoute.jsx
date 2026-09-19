import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole } from '../utils/tokenStorage';

export default function PublicOnlyRoute() {
  const token = getToken();

  if (token) {
    const role = getRole();
    if (role === 1) {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (role === 2) {
      return <Navigate to="/tenant/dashboard" replace />;
    } else if (role === 3) {
      return <Navigate to="/tenant-admin/dashboard" replace />;
    }
    
    // Fallback if role is unknown
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
