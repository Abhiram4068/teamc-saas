import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../api/adminUserApi';
import { useToast } from '../../utils/Toast';
import { validateTenantAdminRequest } from '../../validators/adminUserValidator';
import { useFeatures } from '../../features/FeatureProvider';

export default function TenantAddAdmin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });

  const { features } = useFeatures();
  const adminLimitFeature = features?.find(f => f.code === 'ADMIN_LIMIT');
  const adminLimit = adminLimitFeature ? adminLimitFeature.limit : 0;
  
  const [currentAdminsCount, setCurrentAdminsCount] = useState(0);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await adminUserApi.getTenantAdmins();
        const data = response.data || response;
        setCurrentAdminsCount(data.length);
      } catch (error) {
        console.error("Failed to fetch admins", error);
      } finally {
        setIsLoadingAdmins(false);
      }
    };
    fetchAdmins();
  }, []);

  const isLimitReached = !isLoadingAdmins && adminLimit > 0 && currentAdminsCount >= adminLimit;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError(''); 
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: ''
    });
    setFieldErrors({});
    setApiError('');
  };

  const hasFormValue = Object.values(formData).some(val => val !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setFieldErrors({});

    // Frontend Validation
    const validation = validateTenantAdminRequest(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      await adminUserApi.addTenantAdmin(formData);
      showToast('success', 'Admin user created successfully!');
      navigate('/tenant/administrators');
    } catch (err) {
      if (err.message) {
        setApiError(err.message);
      } else if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' ');
        setApiError(errorMessages);
      } else {
        setApiError('An unexpected error occurred while creating the admin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto space-y-8 pb-20 px-8 mt-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <form onSubmit={handleSubmit} className="w-full">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-slate-200">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Add New Admin For Your Organization
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Create a new administrative user with full organizational access.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            {hasFormValue && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-medium text-xs rounded-lg hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLimitReached}
              title={isLimitReached ? `Your plan only allows ${adminLimit} admin${adminLimit !== 1 ? 's' : ''}` : ''}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Creating...</>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </div>

        {/* Warning / Info Box */}
        <div className="mb-8 py-2.5 px-4 rounded-xs bg-yellow-50 border border-yellow-200 flex items-start">
          <i className="fa-solid fa-circle-info text-yellow-600 mt-0.5 mr-3"></i>
          <div className="flex-1">
            <p className="text-xs text-yellow-800 leading-snug text-justify">
              This will create an admin user for the company who can manage the employees within your organization. 
              They won't have access to billing and subscription settings. 
              According to your plan, you can have a total of <strong>{adminLimit}</strong> admin{adminLimit !== 1 ? 's' : ''}.
            </p>
            {isLimitReached && (
              <p className="text-xs font-bold text-yellow-900 mt-1 text-justify">
                You have reached your limit of <span className="font-black text-red-700">{adminLimit}</span> admin{adminLimit !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
        </div>

        {/* API Error State */}
        {apiError && (
          <div className="mb-6 p-4 flex items-start">
            <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5 mr-3"></i>
            <p className="text-sm font-medium text-red-900">{apiError}</p>
          </div>
        )}

        {/* Form Body Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Details */}
          <div className="lg:w-2/3 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 tracking-tight">
              Personal Information
            </h2>

            <div className="space-y-5">
              {/* First Name & Last Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full bg-white border ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                    placeholder="Enter first name"
                  />
                  {fieldErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full bg-white border ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                    placeholder="Enter last name"
                  />
                  {fieldErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email & Phone row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full bg-white border ${fieldErrors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                    placeholder="admin@company.com"
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full bg-white border ${fieldErrors.phoneNumber ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                    placeholder="Enter numbers only"
                  />
                  {fieldErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Password & Confirm row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full bg-white border ${fieldErrors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full bg-white border ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'} rounded-lg px-3.5 py-2.5 pr-10 focus:outline-none focus:ring-2 text-sm text-slate-900 placeholder-slate-400 transition-all shadow-sm`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Role & Credentials */}
          <div className="lg:w-1/3 space-y-6">
            {/* Role Card */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight">
                Role & Permissions
              </h2>

              <div className="flex items-start">
                <div>
                  <span className="font-semibold text-slate-900 text-sm block">Tenant Admin / Company Admin</span>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    This user will have full read/write privileges across all organizational settings and operational modules.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-2">

              <div className="flex items-start">
                <div>
                  <span className="font-semibold text-slate-900 text-sm block">Employee Management</span>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    This user will be the primary person responsible for managing your company's employees, overseeing roles, and configuring organizational settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}