"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" },
  { name: "QQ", href: "#", icon: "M20.5 10.5c0-2.5-2-4.5-4.5-4.5s-4.5 2-4.5 4.5 2 4.5 4.5 4.5 4.5-2 4.5-4.5zm-9 0c0-2.5-2-4.5-4.5-4.5S2.5 8 2.5 10.5 4.5 15 7 15s4.5-2 4.5-4.5zm9-5c-3 0-9 1.5-9 4.5v2c0 1.5 3 2.5 9 2.5s9-1 9-2.5v-2c0-3-6-4.5-9-4.5z" },
  { name: "主页", href: "#", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-forest-border/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* 左侧：版权 */}
          <div className="text-sm text-forest-text-dim">
            © {currentYear} Helior. All rights reserved.
          </div>

          {/* 中间：社交链接 */}
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-forest-text-dim hover:text-forest-gold transition-colors"
                title={link.name}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={link.icon} />
                </svg>
              </motion.a>
            ))}
          </div>

          {/* 右侧：技术栈 */}
          <div className="text-sm text-forest-text-dim">
            Built with Next.js
          </div>
        </div>
      </div>
    </footer>
  );
}