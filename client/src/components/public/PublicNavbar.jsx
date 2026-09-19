import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const isPriceActive = location.pathname === '/price' || location.pathname === '/pricing';

  useEffect(() => {
    const currentUser = authApi.getCurrentUser();
    setUser(currentUser);
  }, [location.pathname]);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <>


      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white/40 backdrop-blur-md shadow-xs">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">

              <span className="text-xl font-bold text-brand-800 tracking-tight">Teamo</span>
            </Link>
          </div>

          {/* Main Nav (Centered) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 space-x-6 text-sm font-medium text-gray-700">
            <a href="#features" className="hover:text-brand-600 transition">Features</a>
            <a href="#solutions" className="hover:text-brand-600 transition">Solutions</a>
            <a href="#comparison" className="hover:text-brand-600 transition">Comparison</a>
            <Link
              to="/price"
              className={`transition font-semibold ${isPriceActive ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
                }`}
            >
              Pricing
            </Link>
            <a href="#resources" className="hover:text-brand-600 transition">Resources</a>
          </nav>

          {/* Action Buttons / User Profile */}
          <div className="hidden sm:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/tenant/dashboard"
                  className=" text-[#091E42] hover:text-[#091E41]/90 text-sm font-semibold px-4 py-2 rounded-md transition duration-150 shadow-xs cursor-pointer"
                >
                  Access Tenant Portal
                </Link>
                <div
                  className="relative"
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                <button className="flex items-center justify-center w-9 h-9 rounded-full bg-[#091E42] text-white text-sm font-bold shadow-md hover:bg-blue-900 transition-colors">
                    {user.initials}
                  </button>
                  {/* Dropdown Menu Wrapper with invisible bridge */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48 z-50">
                      <div className="bg-white border border-slate-200 rounded-lg shadow-xl py-1">
                        <Link
                          to="/tenant/dashboard"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                        >
                          Access My Tenant Portal
                        </Link>
                        <div className="border-t border-slate-100 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-[#091E42] hover:bg-[#091E42]/90 text-white text-sm font-semibold px-4 py-2 rounded-md transition duration-150 shadow-xs cursor-pointer"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>

          </div>

          {/* Mobile Dropdown Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-4 space-y-2 text-sm font-medium">
              <Link
                to="/price"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-brand-600 font-semibold"
              >
                Pricing
              </Link>
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-brand-600"
              >
                Features
              </a>
              <a
                href="#comparison"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-gray-700 hover:text-brand-600"
              >
                Comparison
              </a>
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to="/tenant/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2 text-brand-600 font-semibold"
                    >
                      Access My Tenant Portal
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-center py-2 text-red-600 font-semibold"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2 text-gray-700 hover:text-brand-600 font-semibold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/price"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center bg-brand-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
      </header>
    </>
  );
}
