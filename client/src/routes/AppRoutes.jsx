import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Lazy loading all route components
const PublicLayout = lazy(() => import('../layouts/PublicLayout'));
const PublicViewPlan = lazy(() => import('../pages/public/PublicViewPlan'));
const PublicLanding = lazy(() => import('../pages/public/Landing'));
const SuperAdminLogin = lazy(() => import('../pages/public/SuperAdminLogin'));
const SuperAdminProtectedRoute = lazy(() => import('./SuperAdminProtectedRoute'));
const TenantProtectedRoute = lazy(() => import('./TenantProtectedRoute'));
const PublicRoute = lazy(() => import('./PublicRoute'));
const Checkout = lazy(() => import('../pages/tenant/Checkout'));
const PaymentSuccess = lazy(() => import('../pages/tenant/PaymentSuccess'));
const PaymentCancel = lazy(() => import('../pages/tenant/PaymentCancel'));
const TenantCheckoutLayout = lazy(() => import('../layouts/TenantCheckoutLayout'));
const TenantLayout = lazy(() => import('../layouts/TenantLayout'));
const TenantDashboard = lazy(() => import('../pages/tenant/TenantDashboard'));
const TenantMyPlan = lazy(() => import('../pages/tenant/TenantMyPlan'));
const TenantViewPlans = lazy(() => import('../pages/tenant/TenantViewPlans'));
const TenantInvoices = lazy(() => import('../pages/tenant/TenantInvoices'));
const TenantAddAdmin = lazy(() => import('../pages/tenant/TenantAddAdmin'));
const TenantAdministrators = lazy(() => import('../pages/tenant/TenantAdministrators'));
const SuperAdminRoute = lazy(() => import('./SuperAdminRoute'));
const SuperAdminLayout = lazy(() => import('../layouts/SuperAdminLayout'));
const SuperAdminDashboard = lazy(() => import('../pages/superadmin/SuperAdminDashboard'));
const SuperAdminViewFeatures = lazy(() => import('../pages/superadmin/SuperAdminViewFeatures'));
const SuperAdminViewPlans = lazy(() => import('../pages/superadmin/SuperAdminViewPlans'));
const SuperAdminViewDetailedPlan = lazy(() => import('../pages/superadmin/SuperAdminViewDetailedPlan'));
const SuperAdminCreatePlan = lazy(() => import('../pages/superadmin/SuperAdminCreatePlan'));
const SuperAdminViewPlanFeatures = lazy(() => import('../pages/superadmin/SuperAdminViewPlanFeatures'));
const SuperAdminTenantsList = lazy(() => import('../pages/superadmin/SuperAdminTenantsList'));

// Tenant Admin Pages
const TenantAdminRoute = lazy(() => import('./TenantAdminRoute'));
const TenantAdminLayout = lazy(() => import('../layouts/TenantAdminLayout'));
const TenantAdminDashboard = lazy(() => import('../pages/tenant-admin/TenantAdminDashboard'));
const TenantAdminEmployees = lazy(() => import('../pages/tenant-admin/TenantAdminEmployees'));
const TenantAdminRegisterUser = lazy(() => import('../pages/tenant-admin/TenantAdminRegisterUser'));
const ManageLeaveTypes = lazy(() => import('../pages/tenant-admin/ManageLeaveTypes'));

// Employee Pages
const EmployeeRoute = lazy(() => import('./EmployeeRoute'));
const EmployeeLayout = lazy(() => import('../layouts/EmployeeLayout'));
const EmployeeDashboard = lazy(() => import('../pages/employee/EmployeeDashboard'));
const EmployeeProfile = lazy(() => import('../pages/employee/EmployeeProfile'));
const EmployeeList = lazy(() => import('../pages/employee/EmployeeList'));
const EmployeeDetails = lazy(() => import('../pages/employee/EmployeeDetails'));
const MyLeaves = lazy(() => import('../pages/employee/leaves/MyLeaves'));
const TeamLeaves = lazy(() => import('../pages/employee/leaves/TeamLeaves'));
const ManageEmployeeLeaves = lazy(() => import('../pages/employee/leaves/ManageEmployeeLeaves'));

const TenantRegistration = lazy(() => import('../pages/public/Register'));
const Login = lazy(() => import('../pages/public/Login'));

// Route guards
const PublicOnlyRoute = lazy(() => import('./PublicOnlyRoute'));

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
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<PublicLanding />} />
            <Route path="/price" element={<PublicViewPlan />} />
            <Route path="/pricing" element={<PublicViewPlan />} />
            <Route path="/landing" element={<PublicLanding />} />
          </Route>
        </Route>

        {/* Login routes that should redirect away if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route element={<PublicLayout />}>
          <Route path="/sign-up" element={<TenantRegistration />} />          
          </Route>
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
        </Route>

        {/* SuperAdmin Protected Routes */}
        <Route element={<SuperAdminProtectedRoute />}>
          {/* SuperAdmin Specific Role Guard */}
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="tenants" element={<SuperAdminTenantsList />} />
              <Route path="features" element={<SuperAdminViewFeatures />} />
              <Route path="plans" element={<SuperAdminViewPlans />} />
              <Route path="create-plan" element={<SuperAdminCreatePlan />} />
              <Route path="plans/:id" element={<SuperAdminViewDetailedPlan />} />
              <Route path="plans/:id/features" element={<SuperAdminViewPlanFeatures />} />
            </Route>
          </Route>
        </Route>

        <Route element={<TenantProtectedRoute />}>
          {/* Main Tenant Portal */}
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantDashboard />} />
            <Route path="my-plan" element={<TenantMyPlan />} />
            <Route path="plans" element={<TenantViewPlans />} />
            <Route path="invoices" element={<TenantInvoices />} />
            <Route path="administrators" element={<TenantAdministrators />} />
            <Route path="add-admin" element={<TenantAddAdmin />} />
          </Route>

          {/* Checkout & Payment */}
          <Route element={<TenantCheckoutLayout />}>
            <Route path="/checkout/:planId" element={<Checkout />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
          </Route>
        </Route>

        {/* Tenant Admin Routes */}
        <Route element={<TenantAdminRoute />}>
          <Route path="/tenant-admin" element={<TenantAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TenantAdminDashboard />} />
            <Route path="users" element={<TenantAdminEmployees />} />
            <Route path="add-user" element={<TenantAdminRegisterUser />} />
            <Route path="leave-types" element={<ManageLeaveTypes />} />
          </Route>
        </Route>

        {/* Employee Routes */}
        <Route element={<EmployeeRoute />}>
          <Route path="/emp" element={<EmployeeLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="profile" element={<EmployeeProfile />} />
            <Route path="employees" element={<EmployeeList />} />
            <Route path="employees/:employeeId" element={<EmployeeDetails />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="approvals" element={<TeamLeaves />} />
            <Route path="leaves/approvals" element={<TeamLeaves />} />
            <Route path="leaves/manage" element={<ManageEmployeeLeaves />} />
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
