"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ForestBackgroundProps {
  children?: React.ReactNode;
}

interface ShootingStar {
  id: number;
  delay: number;
  duration: number;
  startX: number;
}

export function ForestBackground({ children }: ForestBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -50]);

  const [stars, setStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: Math.random() * 8,
      duration: 3 + Math.random() * 2,
      startX: Math.random() * 100,
    }));
    setStars(newStars);
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* 青蓝渐变背景 */}
      <div className="fixed inset-0 gradient-mesh" />

      {/* 流星/彗星效果 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(255,215,0,0.8) 0%, rgba(255,140,0,0.6) 50%, transparent 100%)',
              boxShadow: '0 0 10px 2px rgba(255,200,0,0.5)',
              left: `${star.startX}%`,
              top: '5%',
            }}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, 300],
              y: [0, 150],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="h-px w-32 opacity-60"
              style={{
                background: 'linear-gradient(90deg, rgba(255,215,0,0.8), transparent)',
                transform: 'rotate(-30deg)',
                transformOrigin: 'left center',
              }}
            />
          </motion.div>
        ))}

        {/* 静态星星点缀 */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
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

      {/* 山脉/树木剪影前景装饰 */}
      <motion.div
        style={{ y: y2 }}
        className="fixed bottom-0 left-0 right-0 h-40 pointer-events-none z-0"
      >
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          style={{ color: 'var(--forest-mountain)' }}
        >
          {/* 第一层 - 远山 */}
          <path
            fill="currentColor"
            opacity="0.4"
            d="M0,160 L0,80 Q120,40 240,90 Q360,50 480,70 Q600,30 720,60 Q840,20 960,50 Q1080,10 1200,40 Q1320,20 1440,60 L1440,160 Z"
          />
          {/* 第二层 - 中山 */}
          <path
            fill="currentColor"
            opacity="0.6"
            d="M0,160 L0,110 Q150,70 300,100 Q450,60 600,90 Q750,40 900,70 Q1050,30 1200,60 Q1350,40 1440,80 L1440,160 Z"
          />
          {/* 第三层 - 近山/树木剪影 */}
          <path
            fill="currentColor"
            d="M0,160 L0,130 Q100,100 200,125 Q300,100 400,120 Q500,90 600,115 Q700,85 800,110 Q900,80 1000,105 Q1100,75 1200,100 Q1300,70 1440,95 L1440,160 Z"
          />
        </svg>
      </motion.div>
    </div>
  );
}