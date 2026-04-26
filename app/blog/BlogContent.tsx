"use client";

import { useState, useMemo } from "react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassTag } from "@/components/ui/GlassTag";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: number;
  pinned?: boolean;
}

interface ProfileData {
  name: string;
  avatar?: string;
  social: {
    github?: string;
  };
}

interface BlogContentProps {
  posts: Post[];
  profile: ProfileData | null;
}

export function BlogContent({ posts, profile }: BlogContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(posts.map((p) => p.category));
    return Array.from(cats);
  }, [posts]);

  const allTags = useMemo(() => {
    const tags = new Set(posts.flatMap((p) => p.tags || []));
    return Array.from(tags);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory && post.category !== selectedCategory) return false;
      if (selectedTag && !post.tags?.includes(selectedTag)) return false;
      return true;
    });
  }, [posts, selectedCategory, selectedTag]);

  const categoryColors: Record<string, "gold" | "green" | "blue" | "purple"> = {
    心路历程: "gold",
    技术分享: "green",
    经验总结: "blue",
    默认: "purple",
  };

  const profileName = profile?.name || "Helior";
  const profileAvatar = profile?.avatar;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="lg:w-72 flex-shrink-0">
        <div className="lg:sticky lg:top-24 space-y-6">
          <GlassCard className="p-5">
            <h4 className="text-sm font-medium text-forest-gold mb-3">分类</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  selectedCategory === null
                    ? "bg-forest-gold text-forest-darker"
                    : "bg-forest-card text-forest-text-dim hover:text-forest-gold"
                }`}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    selectedCategory === cat
                      ? "bg-forest-gold text-forest-darker"
                      : "bg-forest-card text-forest-text-dim hover:text-forest-gold"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h4 className="text-sm font-medium text-forest-gold mb-3">标签</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-xs px-2 py-1 rounded-full transition-colors ${
                  selectedTag === null
                    ? "bg-forest-blue text-white"
                    : "bg-forest-card text-forest-text-dim hover:text-forest-blue"
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    selectedTag === tag
                      ? "bg-forest-blue text-white"
                      : "bg-forest-card text-forest-text-dim hover:text-forest-blue"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            {profileAvatar ? (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-forest-gold/30">
                <img
                  src={profileAvatar}
                  alt={profileName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-forest-gold/30 to-forest-accent/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-forest-gold">
                  {profileName.charAt(0)}
                </span>
              </div>
            )}
            <h3 className="text-lg font-medium text-forest-text mb-1">{profileName}</h3>
            <p className="text-sm text-forest-text-dim mb-4">探索代码的浪漫</p>

            <div className="flex justify-center gap-4 mb-4">
              {profile?.social.github && (
                <a href={profile.social.github} className="text-forest-text-dim hover:text-forest-gold transition-colors" title="GitHub">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              )}
              <a href="#" className="text-forest-text-dim hover:text-forest-gold transition-colors" title="QQ">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 16.5c-1.5 1.5-4.5 1.5-6 0-.75-.75-.75-3 0-3.75 1.5-1.5 4.5-1.5 6 0 .75.75.75 3 0 3.75zm-6-6c.75 0 1.5-.75 1.5-1.5S10.75 7.5 10.5 7.5 9 8.25 9 9s.75 1.5 1.5 1.5zm6 0c.75 0 1.5-.75 1.5-1.5S16.75 7 16.5 7.5 15 8.25 15 9s.75 1.5 1.5 1.5z"/>
                </svg>
              </a>
              <a href="#" className="text-forest-text-dim hover:text-forest-gold transition-colors" title="主页">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-forest-card rounded-lg">
                <div className="text-lg font-bold text-forest-gold">{posts.length}</div>
                <div className="text-xs text-forest-text-dim">文章</div>
              </div>
              <div className="p-2 bg-forest-card rounded-lg">
                <div className="text-lg font-bold text-forest-gold">
                  {posts.reduce((sum, p) => sum + p.readingTime, 0)}
                </div>
                <div className="text-xs text-forest-text-dim">阅读(分钟)</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h4 className="text-sm font-medium text-forest-gold mb-2">欢迎来到</h4>
            <p className="text-sm text-forest-text-dim leading-relaxed">
              这里记录了我的技术探索和成长历程，每一篇文章都是一次思考的旅程。
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <h4 className="text-sm font-medium text-forest-gold mb-3">热门文章</h4>
            <div className="space-y-3">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <p className="text-sm text-forest-text group-hover:text-forest-gold transition-colors line-clamp-2">
                    {post.title}
                  </p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>
      </aside>

      <div className="flex-1">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-forest-gold">技术博客</h1>
            <span className="text-forest-text-dim text-sm">
              {filteredPosts.length} 篇文章
              {(selectedCategory || selectedTag) && " (已筛选)"}
            </span>
          </div>
          <p className="text-forest-text-dim mb-8">
            {selectedCategory && `分类: ${selectedCategory}`}
            {selectedCategory && selectedTag && " | "}
            {selectedTag && `标签: ${selectedTag}`}
          </p>
        </ScrollReveal>

        {(selectedCategory || selectedTag) && (
          <button
            onClick={() => { setSelectedCategory(null); setSelectedTag(null); }}
            className="mb-4 text-sm text-forest-gold hover:text-amber-400 transition-colors"
          >
            ← 清除筛选
          </button>
        )}

        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, index) => (
              <ScrollReveal key={post.slug} delay={index * 0.05}>
                <Link href={`/blog/${post.slug}`}>
                  <GlassCard className={`group ${post.pinned ? 'ring-2 ring-forest-gold/50' : ''}`}>
                    {post.pinned && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest-gold/20 text-forest-gold text-xs rounded-full">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v3h2a1 1 0 110 2h-2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5H3a1 1 0 110-2h2V5z"/>
                          </svg>
                          置顶
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-full md:w-48 h-32 bg-gradient-to-br from-forest-blue/20 to-forest-green/20 rounded-card flex-shrink-0 flex items-center justify-center group-hover:from-forest-blue/30 group-hover:to-forest-green/30 transition-all">
                        <svg className="w-10 h-10 text-forest-gold/40 group-hover:text-forest-gold/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <GlassTag color={categoryColors[post.category] || "purple"} size="sm">
                            {post.category}
                          </GlassTag>
                          {post.tags?.slice(0, 2).map((tag) => (
                            <GlassTag key={tag} color="blue" size="sm">
                              {tag}
                            </GlassTag>
                          ))}
                        </div>
                        <h3 className="text-base font-medium text-forest-text mb-2 group-hover:text-forest-gold transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-forest-text-dim line-clamp-2 mb-3">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-forest-text-dim">
                            <span>{new Date(post.date).toLocaleDateString("zh-CN")}</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {post.readingTime} min
                            </span>
                          </div>
                          <span className="text-sm text-forest-gold group-hover:text-amber-400 transition-colors">
                            阅读更多 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </ScrollReveal>
            ))
          ) : (
            <div className="text-center py-12 text-forest-text-dim">
              没有找到匹配的文章
            </div>
          )}
        </div>
      </div>
    </div>
  );
}