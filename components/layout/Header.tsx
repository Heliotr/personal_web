"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SearchModal } from "@/components/content/SearchModal";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/projects", label: "作品" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" },
];

// 静态搜索数据 - 后续可以改为API获取
const staticSearchResults = [
  { type: "project" as const, slug: "pixel-game-engine", title: "像素游戏引擎", description: "基于WebGL的轻量级像素游戏开发引擎" },
  { type: "project" as const, slug: "ai-code-assistant", title: "AI代码助手", description: "基于Claude API的智能编程助手" },
  { type: "blog" as const, slug: "learning-journey", title: "从零到全栈：我的编程学习之路", description: "分享我如何从编程小白成长为全栈开发者的经历" },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);

    // 添加键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "glass border-b border-forest-border/50 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-forest-gold flex items-center justify-center">
              <span className="text-forest-darker font-bold text-sm">P</span>
            </div>
            <span className="text-forest-text font-semibold text-lg tracking-wide group-hover:text-forest-gold transition-colors">
              PORTAL
            </span>
          </Link>

          {/* 导航 */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm transition-colors ${
                  pathname === item.href
                    ? "text-forest-gold"
                    : "text-forest-text-dim hover:text-forest-text"
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-forest-gold rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* 右侧工具 */}
          <div className="hidden md:flex items-center gap-2">
            {/* 搜索按钮 */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-forest-text-dim hover:text-forest-gold hover:bg-forest-card rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">搜索</span>
              <kbd className="ml-1 px-1.5 py-0.5 text-[10px] bg-forest-card rounded">⌘K</kbd>
            </button>

            <ThemeToggle />
            <Link
              href="/login"
              className="text-sm text-forest-text-dim hover:text-forest-gold transition-colors"
            >
              登录
            </Link>
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden text-forest-text p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block w-6 h-0.5 bg-current transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-forest-border/50"
          >
            <nav className="flex flex-col p-4 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm ${
                    pathname === item.href
                      ? "text-forest-gold"
                      : "text-forest-text-dim"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                className="text-sm text-left text-forest-text-dim"
              >
                搜索
              </button>
              <Link
                href="/login"
                className="text-sm text-forest-gold pt-2 border-t border-forest-border/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                登录
              </Link>
            </nav>
          </motion.div>
        )}
      </header>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        results={staticSearchResults}
      />
    </>
  );
}