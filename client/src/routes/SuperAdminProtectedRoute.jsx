import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/tokenStorage';

export default function SuperAdminProtectedRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/superadmin/login" replace />;
  }

  return <Outlet />;
}
