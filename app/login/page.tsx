"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassButton } from "@/components/ui/GlassButton";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // 模拟登录过程
    setTimeout(() => {
      setIsLoading(false);
      alert("登录功能开发中，敬请期待！");
    }, 1000);
  };

  return (
    <ForestBackground>
      <Header />
      <main className="relative pt-32 pb-16 px-6">
        <div className="max-w-md mx-auto">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-forest-text mb-2">欢迎回来</h1>
              <p className="text-forest-text-dim text-sm">登录到你的个人空间</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-forest-text-dim mb-2">邮箱</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-forest-card border border-forest-border rounded-button text-forest-text placeholder:text-forest-text-dim focus:outline-none focus:border-forest-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm text-forest-text-dim mb-2">密码</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-forest-card border border-forest-border rounded-button text-forest-text placeholder:text-forest-text-dim focus:outline-none focus:border-forest-gold transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-forest-text-dim">
                  <input type="checkbox" className="w-4 h-4 rounded bg-forest-card border-forest-border" />
                  记住我
                </label>
                <a href="#" className="text-forest-gold hover:text-amber-400 transition-colors">
                  忘记密码？
                </a>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "登录中..." : "登录"}
              </GlassButton>
            </form>

            <div className="mt-6 text-center text-sm text-forest-text-dim">
              还没有账号？{" "}
              <a href="#" className="text-forest-gold hover:text-amber-400 transition-colors">
                立即注册
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-forest-border/30">
              <p className="text-xs text-forest-text-dim text-center mb-4">其他登���方式</p>
              <div className="flex justify-center gap-4">
                <button className="p-3 bg-forest-card rounded-button hover:bg-forest-card-hover transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </button>
                <button className="p-3 bg-forest-card rounded-button hover:bg-forest-card-hover transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
              </div>
            </div>
          </GlassCard>

          <div className="text-center mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-forest-text-dim hover:text-forest-gold transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回首页
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </ForestBackground>
  );
}