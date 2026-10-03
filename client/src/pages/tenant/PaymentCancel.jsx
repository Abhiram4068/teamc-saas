import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 text-center mx-4">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-4">
            <XCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-3">
          Payment cancelled
        </h1>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Your checkout process was cancelled and no charges were made. You can try again whenever you're ready.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate('/tenant/plans')}
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm"
          >
            Try other plans
          </button>
          
          <button
            onClick={() => navigate('/tenant/dashboard')}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
