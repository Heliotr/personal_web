"use client";

import { useState, useEffect } from "react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;

      if (documentHeight <= 0) {
        setProgress(100);
        return;
      }

      const scrollProgress = Math.min((scrollTop / documentHeight) * 100, 100);
      setProgress(scrollProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-forest-gold to-amber-400 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}