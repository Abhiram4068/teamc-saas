import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken } from '../utils/tokenStorage';

export default function TenantProtectedRoute() {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
