import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isPriceActive = location.pathname === '/price' || location.pathname === '/pricing';

  return (
    <>
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#091E42] text-white text-xs md:text-sm py-2 px-4 text-center font-medium">
        <span>Need custom enterprise deployment or SLA guarantees?</span>
        <a href="#enterprise" className="underline hover:text-blue-200 ml-2 font-semibold transition">
          Talk to Sales &rarr;
        </a>
      </div>

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 group">
              <svg className="w-8 h-8 text-brand-600 transition group-hover:scale-105" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5 10-5Z2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span className="text-xl font-bold text-brand-800 tracking-tight">Teamo</span>
            </Link>

            <nav className="hidden md:flex space-x-6 text-sm font-medium text-gray-700">
              <a href="#features" className="hover:text-brand-600 transition">Features</a>
              <a href="#solutions" className="hover:text-brand-600 transition">Solutions</a>
              <a href="#comparison" className="hover:text-brand-600 transition">Comparison</a>
              <Link
                to="/price"
                className={`transition font-semibold ${
                  isPriceActive ? 'text-brand-600' : 'text-gray-700 hover:text-brand-600'
                }`}
              >
                Pricing
              </Link>
              <a href="#resources" className="hover:text-brand-600 transition">Resources</a>
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition"
            >
              Sign In
            </Link>
            <Link
              to="/price"
              className="bg-brand-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition duration-150 shadow-xs cursor-pointer"
            >
              Get Started Free
            </Link>
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
            </div>
          </div>
        )}
      </header>
    </>
  );
}
