import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full p-10 text-center">
        <h2 className="text-xl text-slate-300 font-bold tracking-tight mb-4">Feature Coming Soon</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          We're working on this feature. Check back soon — it'll be ready shortly.
        </p>
        
        <button
          onClick={goBack}
          className="bg-slate-800 hover:bg-slate-700 text-white transition-colors w-full h-[40px] rounded-sm text-[13px] font-semibold flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;