"use client";

import Link from "next/link";
import { ScrollReveal } from "../animations/ScrollReveal";
import { GlassCard } from "../ui/GlassCard";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: number;
}

interface BlogSectionProps {
  posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <section id="blog" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-forest-gold mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-forest-gold rounded-full" />
            技术博客
          </h2>
        </ScrollReveal>

        <div className="space-y-4">
          {posts.slice(0, 3).map((post, index) => (
            <ScrollReveal key={post.slug} delay={index * 0.1}>
              <Link href={`/blog/${post.slug}`}>
                <GlassCard className="group">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* 配图区域 */}
                    <div className="w-full md:w-32 h-24 bg-gradient-to-br from-forest-blue/20 to-forest-green/20 rounded-card flex-shrink-0 flex items-center justify-center group-hover:from-forest-blue/30 group-hover:to-forest-green/30 transition-all">
                      <svg className="w-8 h-8 text-forest-gold/40 group-hover:text-forest-gold/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-medium text-forest-text mb-2 group-hover:text-forest-gold transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-forest-text-dim line-clamp-2 mb-2">
                        {post.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-forest-text-dim">
                        <span>{new Date(post.date).toLocaleDateString("zh-CN")}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {post.readingTime} min
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <svg className="w-5 h-5 text-forest-text-dim group-hover:text-forest-gold group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors"
            >
              <span>查看全部文章</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}