"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hoverable = true,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={
        hoverable
          ? { y: -4, transition: { duration: 0.3 } }
          : undefined
      }
      className={`
        glass rounded-card p-5
        ${hoverable ? "card-hover cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}