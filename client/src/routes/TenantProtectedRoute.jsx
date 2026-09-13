import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole } from '../utils/tokenStorage';

export default function TenantProtectedRoute() {
  const token = getToken();
  const role = getRole();

  if (!token || role !== 2) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
