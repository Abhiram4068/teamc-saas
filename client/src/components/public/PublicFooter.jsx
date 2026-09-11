import React from 'react';
import { Link } from 'react-router-dom';

export default function PublicFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="font-bold text-brand-800 mb-3">Product</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="hover:underline">Overview</Link></li>
            <li><a href="#features" className="hover:underline">Features</a></li>
            <li><Link to="/price" className="hover:underline">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brand-800 mb-3">Solutions</h4>
          <ul className="space-y-2">
            <li><a href="#solutions" className="hover:underline">Remote Teams</a></li>
            <li><a href="#enterprise" className="hover:underline">Enterprise</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brand-800 mb-3">Resources</h4>
          <ul className="space-y-2">
            <li><a href="#resources" className="hover:underline">Documentation</a></li>
            <li><a href="#resources" className="hover:underline">API Reference</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-brand-800 mb-3">Company</h4>
          <ul className="space-y-2">
            <li><a href="#about" className="hover:underline">About Us</a></li>
            <li><a href="#careers" className="hover:underline">Careers</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Teamo Software Inc. All rights reserved.
      </div>
    </footer>
  );
}
