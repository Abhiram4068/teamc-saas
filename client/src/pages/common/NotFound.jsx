import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f7] flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full p-10 text-center">
        
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold tracking-tight mb-4">Page Not Found</h2>
        
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <button
          onClick={goBack}
          className="bg-black hover:bg-[#222] text-white transition-colors w-full h-[40px] rounded-sm text-[13px] font-semibold flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;