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
        <div className="relative z-10 flex items-center justify-center w-full px-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white whitespace-nowrap select-none font-Nunito text-center drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]">
            {currentPhrase.slice(0, charCount)}
          </h1>
        </div>
      </section>
    </div>
  );
}