import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../api/adminUserApi';
import { useToast } from '../../utils/Toast';
import { validateTenantAdminRequest } from '../../validators/adminUserValidator';

export default function TenantAddAdmin() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Validation
    const validation = validateTenantAdminRequest(formData);
    if (!validation.isValid) {
      setError(validation.errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      await adminUserApi.addTenantAdmin(formData);
      showToast('success', 'Admin user created successfully!');
      navigate('/tenant/dashboard');
    } catch (err) {
      if (err.message) {
        setError(err.message);
      } else if (err.errors) {
        const errorMessages = Object.values(err.errors).flat().join(' ');
        setError(errorMessages);
      } else {
        setError('An unexpected error occurred while creating the admin.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-10 px-8" style={{ fontFamily: "'Nunito Sans', sans-serif" }}>
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs */}
        <div className="flex items-center text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">
          <span className="cursor-pointer hover:underline" onClick={() => navigate('/tenant/administrators')}>ADMINISTRATORS</span>
          <i className="fa-solid fa-chevron-right text-[9px] mx-2.5 text-gray-400"></i>
          <span className="text-gray-500">Add Admin</span>
        </div>

        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-[#141824] tracking-tight">
              Add New Admin For Your Organization
            </h1>
            <p className="text-sm text-gray-500 mt-1">Create a new administrative user with full organizational access.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold text-sm rounded-none hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#2b6cb0] hover:bg-blue-700 text-white font-semibold text-sm rounded-none shadow-sm transition-colors disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? (
                <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Creating...</>
              ) : (
                'Create Admin'
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 rounded-none bg-red-50 border-l-4 border-red-600 flex items-start">
            <i className="fa-solid fa-circle-exclamation text-red-600 mt-0.5 mr-3"></i>
            <p className="text-sm font-medium text-red-900">{error}</p>
          </div>
        )}

        {/* Form Body Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Details */}
          <div className="lg:w-2/3 space-y-6 p-6 ">
            <h2 className="text-lg font-bold text-[#141824] border-b border-gray-100 pb-3 tracking-tight">
              Personal Information
            </h2>

            <div className="space-y-5">
              {/* First Name & Last Name row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-none px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824] placeholder-gray-400 transition-colors"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-none px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824] placeholder-gray-400 transition-colors"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-none px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824] placeholder-gray-400 transition-colors"
                  placeholder="admin@company.com"
                />
              </div>

              {/* Phone Number & Password row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 rounded-none px-3.5 py-2.5 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824] placeholder-gray-400 transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white border border-gray-300 rounded-none px-3.5 py-2.5 pr-10 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-sm text-[#141824] placeholder-gray-400 transition-colors"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Role & Credentials */}
          <div className="lg:w-1/3 space-y-6">
            
            {/* Role Card */}
            <div className=" p-6 ">
              <h2 className="text-lg font-bold text-[#141824] border-b border-gray-100 pb-3 mb-4 tracking-tight">
                Role & Permissions
              </h2>

              <div className="p-3.5 flex items-start">
                <div className="flex items-center h-5 mt-0.5">
                </div>
                <div className="ml-3">
                  <span className="font-bold text-gray-900 text-sm block">Tenant Admin</span>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                    This user will have full read/write privileges across all organizational settings and operational modules.
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