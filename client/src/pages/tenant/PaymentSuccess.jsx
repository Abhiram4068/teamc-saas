import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/tenant/invoices');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 text-center mx-4">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-4">
            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={1.5} />
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-3">
          Payment successful
        </h1>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Thank you for subscribing. Your account has been upgraded and all premium features are now unlocked for your team.
        </p>
        
        <button
          onClick={() => navigate('/tenant/dashboard')}
          className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-sm"
        >
          Go to dashboard
        </button>
        
        <p className="mt-6 text-xs text-gray-400 font-medium">
          Redirecting automatically in {countdown}s
        </p>
      </div>
    </div>
  );
}
