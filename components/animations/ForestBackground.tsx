"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface ForestBackgroundProps {
  children?: React.ReactNode;
}

export function ForestBackground({ children }: ForestBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -50]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* 渐变网格背景 */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />

      {/* 浮动光点 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-forest-gold/20"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* 主内容层 - 视差效果 */}
      <motion.div style={{ y: y1 }} className="relative z-10">
        {children}
      </motion.div>

      {/* 松树剪影装饰 */}
      <motion.div
        style={{ y: y2 }}
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-0"
      >
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          style={{ color: '#0d1520' }}
        >
          <path
            fill="currentColor"
            d="M0,120 L0,80 Q80,60 160,90 Q240,60 320,80 Q400,40 480,70 Q560,30 640,60 Q720,20 800,50 Q880,10 960,40 Q1040,0 1120,30 Q1200,10 1280,40 Q1360,20 1440,60 L1440,120 Z"
          />
          <path
            fill="currentColor"
            opacity="0.7"
            d="M0,120 L0,100 Q100,80 200,100 Q300,70 400,90 Q500,50 600,80 Q700,40 800,70 Q900,30 1000,60 Q1100,20 1200,50 Q1300,10 1440,40 L1440,120 Z"
          />
        </svg>
      </motion.div>
    </div>
  );
}