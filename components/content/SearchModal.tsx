"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface SearchResult {
  type: "project" | "blog";
  slug: string;
  title: string;
  description: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
}

export function SearchModal({ isOpen, onClose, results }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = query.trim()
    ? results.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleResultClick = () => {
    onClose();
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest-darker/80 backdrop-blur-sm z-50"
          />

          {/* 搜索弹窗 */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
          >
            <div className="glass rounded-card overflow-hidden">
              {/* 搜索输入框 */}
              <div className="p-4 border-b border-forest-border/50">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-forest-text-dim"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="搜索项目或文章..."
                    className="flex-1 bg-transparent text-forest-text placeholder:text-forest-text-dim outline-none"
                  />
                  <button
                    onClick={onClose}
                    className="text-xs text-forest-text-dim hover:text-forest-gold transition-colors"
                  >
                    ESC
                  </button>
                </div>
              </div>

              {/* 搜索结果 */}
              {query.trim() && (
                <div className="max-h-80 overflow-y-auto">
                  {filteredResults.length > 0 ? (
                    <div className="p-2">
                      {filteredResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.slug}`}
                          href={
                            result.type === "project"
                              ? `/projects/${result.slug}`
                              : `/blog/${result.slug}`
                          }
                          onClick={handleResultClick}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-forest-card-hover transition-colors"
                        >
                          <div className="mt-1">
                            {result.type === "project" ? (
                              <svg
                                className="w-4 h-4 text-forest-gold"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-forest-blue"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-forest-text font-medium truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-forest-text-dim truncate">
                              {result.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-forest-text-dim">
                      未找到相关结果
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}