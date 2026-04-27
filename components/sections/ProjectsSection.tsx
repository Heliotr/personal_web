"use client";

import Link from "next/link";
import { ScrollReveal } from "../animations/ScrollReveal";
import { GlassCard } from "../ui/GlassCard";

interface Project {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  status: "completed" | "in-progress" | "archived";
  thumbnail: string;
  gif?: string;
  featured?: boolean;
}

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  // 分离featured项目和其他项目
  const featuredProjects = projects.filter(p => p.featured).slice(0, 1);
  const otherProjects = projects.filter(p => !p.featured).slice(0, 5);

  return (
    <section id="projects" className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-forest-gold mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-forest-gold rounded-full" />
            精选项目
          </h2>
        </ScrollReveal>

        {/* 不规则网格布局 */}
        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[500px]">
          {/* 大卡片 - 2x2 展示第一个featured项目 */}
          {featuredProjects.length > 0 && (
            <ScrollReveal delay={0.1}>
              <Link href={`/projects/${featuredProjects[0].slug}`} className="col-span-2 row-span-2 block h-full">
                <GlassCard className="h-full group overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 bg-gradient-to-br from-forest-blue/40 to-forest-green/40 rounded-card mb-4 flex items-center justify-center overflow-hidden">
                      {featuredProjects[0].gif ? (
                        <video
                          src={featuredProjects[0].gif}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : featuredProjects[0].thumbnail ? (
                        <img
                          src={featuredProjects[0].thumbnail}
                          alt={featuredProjects[0].title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-16 h-16 text-forest-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-forest-text mb-1 group-hover:text-forest-gold transition-colors">
                      {featuredProjects[0].title}
                    </h3>
                    <p className="text-sm text-forest-text-dim line-clamp-2">
                      {featuredProjects[0].description}
                    </p>
                  </div>
                </GlassCard>
              </Link>
            </ScrollReveal>
          )}

          {/* 小卡片 - 右侧2个 */}
          {otherProjects.slice(0, 2).map((project, index) => (
            <ScrollReveal key={project.slug} delay={0.1 + index * 0.05}>
              <Link href={`/projects/${project.slug}`} className="col-span-2 row-span-1 block">
                <GlassCard className="h-full group overflow-hidden">
                  <div className="h-full flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-forest-blue/30 to-forest-green/30 rounded-card flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {project.gif ? (
                        <video
                          src={project.gif}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-forest-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-forest-text mb-1 group-hover:text-forest-gold transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-forest-text-dim line-clamp-1">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </ScrollReveal>
          ))}

          {/* 底部小卡片 - 2个 */}
          {otherProjects.slice(2, 4).map((project, index) => (
            <ScrollReveal key={project.slug} delay={0.2 + index * 0.05}>
              <Link href={`/projects/${project.slug}`} className="col-span-2 row-span-1 block">
                <GlassCard className="h-full group overflow-hidden">
                  <div className="h-full flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-forest-blue/30 to-forest-green/30 rounded-card flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {project.gif ? (
                        <video
                          src={project.gif}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-forest-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-forest-text mb-1 group-hover:text-forest-gold transition-colors truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-forest-text-dim line-clamp-1">
                        {project.description}
                      </p>
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
              href="/projects"
              className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors"
            >
              <span>查看全部项目</span>
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