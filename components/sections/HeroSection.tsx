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
        {/* 标题区域 - 带几何装饰 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative inline-block"
        >
          {/* 左侧几何装饰 */}
          <motion.div
            className="absolute -left-16 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-3 h-3 rotate-45 border-2 border-forest-gold/50" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-forest-gold/30" />
          </motion.div>

          {/* 右侧几何装饰 */}
          <motion.div
            className="absolute -right-16 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-forest-gold/30" />
            <div className="w-3 h-3 rotate-45 border-2 border-forest-gold/50" />
          </motion.div>

          {/* 主标题 - 渐变色动画 */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-4">
            <motion.span
              className="text-gradient-title inline-block"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Helior的小破站
            </motion.span>
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

        {/* CTA按钮 - 更扁平的毛玻璃效果 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Link href="/projects">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-gradient-to-r from-forest-gold to-orange-500 text-forest-darker font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              探索作品
            </motion.button>
          </Link>
          <Link href="/blog">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-forest-text font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              阅读博客
            </motion.button>
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