import React from 'react';
import { Link } from 'react-router-dom';

export default function CheckoutFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 py-5 text-center text-xs text-slate-500 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
          &copy; 2026 Teamo Software Inc. All rights reserved. &bull; <Link to="#" className="hover:underline text-slate-600">Privacy Policy</Link> &bull; <Link to="#" className="hover:underline text-slate-600">Terms of Service</Link>
      </div>
    </footer>
  );
}
