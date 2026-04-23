"use client";

import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchInterval?: number;
}

export function GlitchText({
  text,
  className = "",
  glitchInterval = 3000,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [glitchInterval]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 text-pixel-red opacity-80"
            style={{ clipPath: "inset(0 0 50% 0)", transform: "translate(-2px, 2px)" }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 text-pixel-blue opacity-80"
            style={{ clipPath: "inset(50% 0 0 0)", transform: "translate(2px, -2px)" }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}