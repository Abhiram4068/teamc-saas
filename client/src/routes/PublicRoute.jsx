import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getRole, parseJwt } from '../utils/tokenStorage';

export default function PublicRoute() {
  // Allow both authenticated and unauthenticated users to view public pages like Landing or Pricing
  return <Outlet />;
}
