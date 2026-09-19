import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import heroBg from '../../assets/hero2.jpg';

export default function PublicLanding() {
  const phrases = [
    'Tired of workspace chaos?',
    'This is Teamo.',
    'Access, manage, and scale.',
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    let timeout;

    if (!isDeleting) {
      if (charCount < currentPhrase.length) {
        // Typewriter typing forward
        timeout = setTimeout(() => {
          setCharCount((prev) => prev + 1);
        }, 75);
      } else {
        // Pause after fully typing the phrase
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1600);
      }
    } else {
      if (charCount > 0) {
        // Typewriter backspacing
        timeout = setTimeout(() => {
          setCharCount((prev) => prev - 1);
        }, 35);
      } else {
        // Switch to the next phrase and start typing again
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [charCount, isDeleting, phraseIndex, currentPhrase]);

  return (
    <div className="w-full bg-slate-900 selection:bg-blue-200 selection:text-brand-800">
      <section
        className="relative w-full flex items-center justify-center overflow-hidden px-4 sm:px-4 lg:px-8 py-10"
        style={{
          minHeight: 'calc(100vh - 64px)',
          minHeight: 'calc(100dvh - 64px)',
        }}
      >
        {/* Background Image: Fits screen width and height */}
        <img
          src={heroBg}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        />

        {/* Ambient Glassy Overlay */}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-md" />

        {/* Centered Typewriter Text (Rotates through the 3 phrases) */}
        <div className="relative z-10 flex items-center justify-center w-full px-4 -mt-24 sm:-mt-32">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white whitespace-nowrap select-none font-sans text-center drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
            {currentPhrase.slice(0, charCount)}
          </h1>
        </div>
      </section>
      {/* Sponsored By Section */}
      <section 
        className="w-full bg-white px-4 sm:px-6 lg:px-8 border-t border-gray-100 flex flex-col justify-center"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center w-full py-16">
          <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-8">Our customers</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-90">
            <span className="text-2xl font-bold text-[#0052FF]">coinbase</span>
            <span className="text-2xl font-bold text-[#1DB954]">Spotify</span>
            <span className="text-2xl font-bold text-[#E60023] font-serif">Pinterest</span>
            <span className="text-2xl font-bold text-[#4285F4]">Google</span>
            <span className="text-2xl font-bold text-black tracking-tighter">amazon</span>
            <span className="text-2xl font-bold text-[#E50914] tracking-widest font-sans uppercase transform scale-y-110">Netflix</span>
          </div>

          {/* Info Section */}
          <div className="mt-24 flex flex-col items-center text-center">
            <p className="text-orange-500 font-semibold text-sm mb-3">About the platform</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-6">Who uses Teamo?</h2>
            <p className="text-slate-500 max-w-2xl text-base sm:text-lg leading-relaxed">
              Welcome to Teamo, where the future of work unfolds! Whether you're a seasoned HR professional, a growing startup, or a business leader looking to harness the power of efficient employee management, this platform is designed to streamline, organize, and scale your operations.
            </p>
          </div>
        </div>
      </section>

      {/* What Teamo Offers Section */}
      <section className="w-full bg-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">What Teamo Offers?</h2>

          <div className="w-full max-w-7xl mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-8 relative z-10">
              
              {/* Feature 1 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Seamless Onboarding</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  No need to stress about chaotic employee records. Centralize your data and have your entire workforce management unified.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Rapid Deployment</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Deploy organization-wide updates in seconds. Get your entire team on board with an intuitive, frictionless dashboard.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Time & Attendance</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Automated time tracking, leave management, and shift scheduling integrated seamlessly directly with your payroll exports.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Performance Tracking</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Structured evaluation cycles, goal setting, and continuous feedback tools to foster growth and align team objectives.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Enterprise Security</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Role-based access control, SSO integration, and comprehensive audit logs to keep your HR data locked down safely.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="text-slate-900 space-y-3">
                <h3 className="text-xl font-semibold tracking-tight">Automated Workflows</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Streamline onboarding, offboarding, and routine approvals with customizable, trigger-based workflow automations.
                </p>
              </div>

            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
}