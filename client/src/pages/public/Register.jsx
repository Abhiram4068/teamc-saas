import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { validateRegistrationStep1, validateRegistrationStep2, validateRegistrationStep3 } from '../../validators/registerValidator';

export default function TenantRegistration() {
  const navigate = useNavigate();

  // Step state: 1 (CIN), 2 (Details), 3 (Admin Credentials)
  const [step, setStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);

  const [formData, setFormData] = useState({
    cin: '',
    companyName: '',
    incorporationDate: '',
    companyStatus: 'Active',
    address: '',
    pincode: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const [isVerifyingCin, setIsVerifyingCin] = useState(false);
  const [cinError, setCinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleVerifyCin = async (e) => {
    e.preventDefault();
    setCinError('');
    setFieldErrors({});

    const errors = validateRegistrationStep1(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsVerifyingCin(true);
    const result = await authApi.verifyCin(formData.cin);
    setIsVerifyingCin(false);

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        companyName: result.data.companyName || result.data.CompanyName || '',
        incorporationDate: result.data.incorporationDate || result.data.IncorporationDate || '',
        companyStatus: result.data.status || result.data.Status || 'Active'
      }));
      setStep(2);
      setHighestStep(prev => Math.max(prev, 2));
    } else {
      setCinError(result.message);
    }
  };

  const handleCompanyDetailsNext = (e) => {
    e.preventDefault();
    setSubmitError('');
    
    const errors = validateRegistrationStep2(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setStep(3);
    setHighestStep(prev => Math.max(prev, 3));
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setFieldErrors({});

    const errors = validateRegistrationStep3(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authApi.registerTenant({
        cin: formData.cin,
        companyName: formData.companyName,
        address: formData.address,
        pincode: formData.pincode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.adminEmail,
        password: formData.adminPassword,
        phoneNumber: formData.phoneNumber
      });

      if (result.success) {
        navigate('/login?registered=true');
      } else {
        if (result.validationErrors) {
          const mappedErrors = {};
          Object.keys(result.validationErrors).forEach(key => {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            mappedErrors[camelKey] = Array.isArray(result.validationErrors[key]) ? result.validationErrors[key][0] : result.validationErrors[key];
          });
          setFieldErrors(mappedErrors);
          setSubmitError(result.message);
        } else {
          setSubmitError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Registration submit error:', err);
      setSubmitError('A network error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 relative z-0">
      {/* Top Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-blue-200 via-blue-100 to-slate-50 -z-10 pointer-events-none" />
      
      {/* HEADER AREA */}
      <header className="pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Registration</h1>
          
          <div className="mt-2">
            <p className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in to workspace
              </Link>
            </p>
          </div>

          {/* EXACT STEPPER DESIGN FROM IMAGE */}
<div className="mt-6 flex items-center justify-center gap-3.5 text-xs font-medium">
            
            {/* STEP 1: CIN VERIFICATION */}
            <div
              onClick={() => setStep(1)}
              className="flex items-center gap-2.5 transition cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white transition ${
                  step === 1
                    ? 'bg-slate-900 ring-2 ring-slate-900 ring-offset-2'
                    : highestStep > 1
                    ? 'bg-emerald-600'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step === 1 ? (
                  '1'
                ) : highestStep > 1 ? (
                  <svg className="w-3.5 h-3.5 stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  '1'
                )}
              </div>
              <span className={`text-sm ${step === 1 ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                CIN Verification
              </span>
            </div>

            {/* DIVIDER 1 */}
            <div className={`w-10 h-[2px] transition-colors ${step > 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* STEP 2: COMPANY DETAILS */}
            <div
              onClick={() => highestStep >= 2 && setStep(2)}
              className={`flex items-center gap-2.5 transition ${
                highestStep >= 2 ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                  step === 2
                    ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                    : highestStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400'
                }`}
              >
                {step === 2 ? (
                  '2'
                ) : highestStep > 2 ? (
                  <svg className="w-3.5 h-3.5 stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${step === 2 ? 'text-slate-900 font-semibold' : step > 2 ? 'text-slate-700' : 'text-slate-400'}`}>
                Company Details
              </span>
            </div>

            {/* DIVIDER 2 */}
            <div className={`w-10 h-[2px] transition-colors ${step > 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

            {/* STEP 3: LOGIN SETUP */}
            <div
              onClick={() => highestStep >= 3 && setStep(3)}
              className={`flex items-center gap-2.5 transition ${
                highestStep >= 3 ? 'cursor-pointer' : ''
              }`}
            >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                    step === 3
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                      : highestStep >= 3
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400'
                  }`}
                >
                  {step === 3 ? (
                    '3'
                  ) : highestStep >= 3 ? (
                    <svg className="w-3.5 h-3.5 stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  )}
                </div>
              <span className={`text-sm ${step === 3 ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                Setup Credentials 
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-6xl mx-auto w-full px-4 pt-2 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FORM CONTAINER */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-xs p-6 sm:p-8">
            
            {/* STEP 1: CIN INPUT */}
            {step === 1 && (
              <form onSubmit={handleVerifyCin} className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Corporate Identity</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter your Corporate Identification Number (CIN) registered with MCA.
                  </p>
                </div>

                {cinError && (
                  <div className="p-3 text-xs text-red-700">
                    {cinError}
                  </div>
                )}

                <div>
                  <label htmlFor="cin" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    CIN Number
                  </label>
                  <input
                    type="text"
                    id="cin"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    placeholder="e.g. U72200MH2023PTC123456"
                    className={`w-full px-3 py-2 text-sm uppercase tracking-wider border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.cin ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                    required
                  />
                  {fieldErrors.cin && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.cin}</p>}
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCin}
                  className="w-full py-2.5 px-4 bg-[#091E42] hover:bg-[#071732] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingCin ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}

            {/* STEP 2: COMPANY DETAILS */}
            {step === 2 && (
              <form onSubmit={handleCompanyDetailsNext} className="space-y-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Company Information</h2>
                  <p className="text-xs text-slate-500">
                    Review verified parameters and complete the registered address details.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 text-xs text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">MCA Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium text-emerald-600">
                      Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400 uppercase">CIN</span>
                      <span className="text-xs font-semibold text-slate-800">{formData.cin}</span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-medium text-slate-400 uppercase">Company Name</span>
                      <span className="text-xs font-semibold text-slate-800">{formData.companyName}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-xs font-semibold text-slate-700 mb-1">
                      Registered Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Building, Street, Area"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.address && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="pincode" className="block text-xs font-semibold text-slate-700 mb-1">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="600001"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.pincode && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.pincode}</p>}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    ← Change CIN
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-[#091E42] hover:bg-[#071732] text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                  >
                    Next: Setup Credentials →
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: LOGIN CREDENTIALS */}
            {step === 3 && (
              <form onSubmit={handleSubmitRegistration} className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Admin Credentials</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set up the primary work email and password to access your company workspace.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 text-xs text-red-700 ">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jane"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.firstName && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.lastName && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 9876543210"
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                    required
                  />
                  {fieldErrors.phoneNumber && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.phoneNumber}</p>}
                </div>

                <div>
                  <label htmlFor="adminEmail" className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="admin@company.com"
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.adminEmail ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                    required
                  />
                  {fieldErrors.adminEmail && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.adminEmail}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="adminPassword"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.adminPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.adminPassword && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.adminPassword}</p>}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-slate-900'}`}
                      required
                    />
                    {fieldErrors.confirmPassword && <p className="text-red-500 text-[10px] mt-1">{fieldErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-5 bg-[#091E42] hover:bg-[#071732] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete & Finish'}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Registration Notes</h3>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Ensure the provided CIN matches your official MCA incorporation document.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>The business address specified here will be used for official platform invoicing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Admin credentials configured here grant full workspace control upon login.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-600 shadow-xs">
              <p className="font-semibold text-slate-800 mb-1">Multi-Tenant Isolation</p>
              <p className="leading-relaxed">
                Your workspace environment is isolated upon registration. Data access policies are automatically bounded to your organization ID.
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Enterprise Systems. All rights reserved.
      </footer>
    </div>
  );
}
