import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjects } from "@/lib/markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ReadingProgress } from "@/components/animations/ReadingProgress";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassTag } from "@/components/ui/GlassTag";
import { GlassButton } from "@/components/ui/GlassButton";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const statusColor = {
    completed: "green" as const,
    "in-progress": "blue" as const,
    archived: "purple" as const,
  };

  return (
    <ForestBackground>
      <ReadingProgress />
      <Header />
      <main className="relative pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors mb-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回项目列表
            </Link>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <h1 className="text-3xl font-semibold text-forest-text mb-4">
              {project.title}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <GlassTag color={statusColor[project.status]} size="md">
                {project.status === "completed"
                  ? "已完成"
                  : project.status === "in-progress"
                  ? "进行中"
                  : "归档"}
              </GlassTag>
              <span className="text-forest-text-dim">
                {new Date(project.date).toLocaleDateString("zh-CN")}
              </span>
            </div>
          </ScrollReveal>

          {/* 主图/缩略图展示 */}
          <ScrollReveal delay={0.25}>
            <div className="aspect-video bg-gradient-to-br from-forest-blue/30 to-forest-green/30 rounded-card mb-8 flex items-center justify-center overflow-hidden">
              {project.thumbnail ? (
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${project.thumbnail})` }} />
              ) : (
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-forest-gold/40 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p className="text-forest-text-dim text-sm">项目封面图</p>
                </div>
              )}
            </div>
          </ScrollReveal>

          {/* 截图画廊 */}
          {project.screenshots && project.screenshots.length > 0 && (
            <ScrollReveal delay={0.3}>
              <GlassCard className="p-6 mb-6">
                <h3 className="text-lg font-medium text-forest-gold mb-4">项目截图</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-gradient-to-br from-forest-blue/20 to-forest-green/20 rounded-card overflow-hidden"
                    >
                      <img
                        src={screenshot}
                        alt={`截图 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.35}>
            <p className="text-lg text-forest-text-dim mb-8">
              {project.description}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <GlassCard className="p-6 mb-6">
              <h3 className="text-lg font-medium text-forest-gold mb-4">技术栈</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <GlassTag key={tech} color="gold" size="sm">
                    {tech}
                  </GlassTag>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>

          {project.links && (
            <ScrollReveal delay={0.5}>
              <GlassCard className="p-6 mb-6">
                <h3 className="text-lg font-medium text-forest-gold mb-4">相关链接</h3>
                <div className="flex gap-3 flex-wrap">
                  {project.links.demo && (
                    <a href={project.links.demo} target="_blank" rel="noopener noreferrer">
                      <GlassButton variant="primary" size="sm">在线演示</GlassButton>
                    </a>
                  )}
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                      <GlassButton variant="secondary" size="sm">GitHub</GlassButton>
                    </a>
                  )}
                  {project.links.documentation && (
                    <a href={project.links.documentation} target="_blank" rel="noopener noreferrer">
                      <GlassButton variant="ghost" size="sm">文档</GlassButton>
                    </a>
                  )}
                </div>
              </GlassCard>
            </ScrollReveal>
          )}

          <ScrollReveal delay={0.6}>
            <GlassCard className="p-6 md:p-8">
              <div
                className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-forest-text prose-headings:font-medium
                  prose-p:text-forest-text-dim prose-p:leading-relaxed
                  prose-a:text-forest-gold prose-a:no-underline hover:prose-a:text-amber-400
                  prose-code:text-forest-gold prose-code:bg-forest-card prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-forest-darker prose-pre:border prose-pre:border-forest-border prose-pre:rounded-card"
                dangerouslySetInnerHTML={{ __html: project.contentHtml }}
              />
            </GlassCard>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </ForestBackground>
  );
}