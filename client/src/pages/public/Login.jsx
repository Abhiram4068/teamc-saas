import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function TenantLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected from a successful registration
  const queryParams = new URLSearchParams(location.search);
  const isNewlyRegistered = queryParams.get('registered') === 'true';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setLoginError('Please enter both your work email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await authApi.publicLogin(formData.email, formData.password);

      if (result.success) {
        const { getRole } = await import('../../utils/tokenStorage');
        const role = getRole();

        if (role === 1) {
          navigate('/superadmin/dashboard');
        } else if (role === 2) {
          navigate('/tenant/dashboard');
        } else if (role === 3) {
          navigate('/tenant-admin/dashboard');
        } else if (role === 4 || role === 5 || role === 6) {
          navigate('/emp/dashboard');
        } else {
          navigate('/price');
        }
      } else {
        setLoginError(result.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setLoginError('A network error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-sans text-slate-800 bg-white justify-center">
      {/* LOGIN FORM AREA */}
      <div className="w-full max-w-xl min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        
        {/* Top Navigation / Brand */}
        <div className="flex flex-col items-start gap-5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-slate-900 transition-colors text-xs font-semibold group"
          >
            <svg className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go back
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Teamo<span className="text-blue-600">.</span>
          </h1>
        </div>

        {/* Main Login Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Sign in to your workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Welcome back! Please enter your corporate credentials to continue.
            </p>
            {loginError && (
              <div className="mt-4 p-3 text-xs text-red-700">
                {loginError}
              </div>
            )}
          </div>

          {isNewlyRegistered && (
            <div className="mb-6 p-3 text-xs text-emerald-700">
              Registration successful! Please sign in using your newly configured admin credentials.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@company.com"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all duration-200"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-slate-400 transition-all duration-200 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#091E42] hover:bg-[#071732] text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-500">New to Teamo?</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link 
              to="/sign-up" 
              className="py-3 px-4 hover: text-slate-700 text-xs font-semibold"
            >
              Register your organization
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 text-center">
          &copy; {new Date().getFullYear()} Teamo Systems. All rights reserved.
        </div>
      </div>




    </div>
  );
}