import { getAllProjects } from "@/lib/markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassTag } from "@/components/ui/GlassTag";
import Link from "next/link";

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const statusColors = {
    completed: "green" as const,
    "in-progress": "blue" as const,
    archived: "purple" as const,
  };

  return (
    <ForestBackground>
      <Header />
      <main className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <h1 className="text-3xl font-semibold text-forest-gold mb-2">项目作品</h1>
            <p className="text-forest-text-dim mb-8">共 {projects.length} 个项目</p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ScrollReveal key={project.slug} delay={index * 0.05}>
                <Link href={`/projects/${project.slug}`}>
                  <GlassCard className="h-full group">
                    <div className="aspect-video bg-gradient-to-br from-forest-blue/30 to-forest-green/30 rounded-card mb-4 flex items-center justify-center group-hover:from-forest-blue/40 group-hover:to-forest-green/40 transition-all">
                      <svg className="w-12 h-12 text-forest-gold/50 group-hover:text-forest-gold/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <GlassTag color={statusColors[project.status]} size="sm">
                        {project.status === "completed"
                          ? "已完成"
                          : project.status === "in-progress"
                          ? "进行中"
                          : "归档"}
                      </GlassTag>
                    </div>

                    <h3 className="text-base font-medium text-forest-text mb-2 group-hover:text-forest-gold transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-forest-text-dim mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 bg-forest-card rounded-full text-forest-text-dim"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-forest-text-dim mt-4">
                      {new Date(project.date).toLocaleDateString("zh-CN")}
                    </div>
                  </GlassCard>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                返回首页
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </ForestBackground>
  );
}