"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function GlassButton({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  onClick,
  className = "",
  disabled = false,
}: GlassButtonProps) {
  const variants = {
    primary: "bg-forest-gold text-forest-darker hover:bg-forest-gold-dark",
    secondary: "glass glass-hover text-forest-text",
    ghost: "bg-transparent text-forest-text hover:bg-forest-card",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <motion.button
      type={type}
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { y: 0 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-button font-medium
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer btn-hover"}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}