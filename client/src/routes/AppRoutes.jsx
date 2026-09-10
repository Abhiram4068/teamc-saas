import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Lazy loading all route components
const SuperAdminLogin = lazy(() => import('../pages/public/SuperAdminLogin'));
const ProtectedRoute = lazy(() => import('./ProtectedRoute'));
const SuperAdminRoute = lazy(() => import('./SuperAdminRoute'));
const SuperAdminLayout = lazy(() => import('../layouts/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('../pages/superadmin/SuperAdminDashboard'));
const SuperAdminViewFeatures = lazy(() => import('../pages/superadmin/SuperAdminViewFeatures'));
const SuperAdminViewPlans = lazy(() => import('../pages/superadmin/SuperAdminViewPlans'));
const SuperAdminViewDetailedPlan = lazy(() => import('../pages/superadmin/SuperAdminViewDetailedPlan'));
const SuperAdminCreatePlan = lazy(() => import('../pages/superadmin/SuperAdminCreatePlan'));

// Fallback page
const NotFound = lazy(() => import('../pages/common/NotFound'));

// Page loader placeholder during suspense fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGlobalNavigate = (event) => {
      const { path, options } = event.detail || {};
      if (path) {
        navigate(path, options);
      }
    };

    window.addEventListener('global-navigate', handleGlobalNavigate);
    return () => {
      window.removeEventListener('global-navigate', handleGlobalNavigate);
    };
  }, [navigate]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<SuperAdminLogin />} />
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* SuperAdmin Specific Role Guard */}
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="features" element={<SuperAdminViewFeatures />} />
              <Route path="plans" element={<SuperAdminViewPlans />} />
              <Route path="create-plan" element={<SuperAdminCreatePlan />} />
              <Route path="plans/:id" element={<SuperAdminViewDetailedPlan />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
