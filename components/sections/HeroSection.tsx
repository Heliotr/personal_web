"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassButton } from "../ui/GlassButton";

const quotesLines = [
  "代码是诗，逻辑是韵脚",
  "在二进制世界里寻找浪漫",
  "每一行代码都是一次创作",
  "让技术成为艺术的载体",
  "思考如树，代码如林",
  "用键盘敲出星辰大海",
  "创意不死，代码永生",
  "在算法的海洋中航行",
  "让每一个函数都有灵魂",
  "简约而不简单，优雅而有效",
  "优秀的代码自己说话",
  "在循环中寻找永恒",
];

export function HeroSection() {
  const [quote, setQuote] = useState(quotesLines[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(quotesLines[Math.floor(Math.random() * quotesLines.length)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-6 pt-20">
      <div className="max-w-4xl text-center">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-4">
            <span className="bg-gradient-to-r from-forest-gold to-amber-400 bg-clip-text text-transparent">
              PORTAL
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-forest-text-dim mb-8 font-light">
            个人作品集 · 技术博客 · 创意空间
          </p>
        </motion.div>

        {/* 诗意标语 */}
        <motion.div
          key={quote}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <p className="text-lg text-forest-accent italic font-light">
            "{quote}"
          </p>
        </motion.div>

        {/* CTA按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/projects">
            <GlassButton variant="primary" size="lg">
              探索作品
            </GlassButton>
          </Link>
          <Link href="/blog">
            <GlassButton variant="secondary" size="lg">
              阅读博客
            </GlassButton>
          </Link>
        </motion.div>

        {/* 滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-forest-text-dim tracking-widest">SCROLL</span>
            <div className="w-0.5 h-8 bg-gradient-to-b from-forest-gold to-transparent rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}