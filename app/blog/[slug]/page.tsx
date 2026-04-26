import { notFound } from "next/navigation";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { ReadingProgress } from "@/components/animations/ReadingProgress";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlassTag } from "@/components/ui/GlassTag";
import { TableOfContents } from "@/components/content/TableOfContents";
import Link from "next/link";

// 基于 slug 生成固定的伪随机观看次数（静态站点无后端）
function getViewCount(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 8000 + 200;
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categoryColors: Record<string, "gold" | "green" | "blue" | "purple"> = {
    心路历程: "gold",
    技术分享: "green",
    经验总结: "blue",
    默认: "purple",
  };

  return (
    <ForestBackground>
      <ReadingProgress />
      <Header />
      <main className="relative pt-24 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 左侧目录 */}
            <aside className="hidden lg:block lg:w-56 flex-shrink-0">
              <div className="sticky top-24">
                <TableOfContents contentHtml={post.contentHtml} />
              </div>
            </aside>

            {/* 中间内容 */}
            <article className="flex-1 min-w-0">
              <ScrollReveal>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors mb-4"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回博客列表
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <GlassTag
                    color={categoryColors[post.category] || "purple"}
                    size="md"
                  >
                    {post.category}
                  </GlassTag>
                  {post.tags?.map((tag) => (
                    <GlassTag key={tag} color="blue" size="sm">
                      {tag}
                    </GlassTag>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <h1 className="text-2xl md:text-3xl font-semibold text-forest-text mb-4">
                  {post.title}
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex items-center gap-4 mb-8 text-forest-text-dim">
                  <span>{new Date(post.date).toLocaleDateString("zh-CN")}</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {Number(post.readingTime) || 0} min
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {getViewCount(slug).toLocaleString()} 次观看
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <p className="text-lg text-forest-accent mb-8 pl-4 border-l-4 border-forest-gold">
                  {post.description}
                </p>
              </ScrollReveal>

              <ScrollReveal delay={0.5}>
                <GlassCard className="p-6 md:p-8">
                  <div
                    className="prose prose-invert prose-lg max-w-none
                      prose-headings:text-forest-text prose-headings:font-medium prose-headings:text-xl
                      prose-p:text-forest-text-dim prose-p:leading-relaxed
                      prose-a:text-forest-gold prose-a:no-underline hover:prose-a:text-amber-400
                      prose-code:text-forest-gold prose-code:bg-forest-card prose-code:px-2 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-forest-darker prose-pre:border prose-pre:border-forest-border prose-pre:rounded-card prose-pre:p-4
                      prose-ul:text-forest-text-dim prose-ol:text-forest-text-dim
                      prose-li:marker:text-forest-gold"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                  />
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.6}>
                <div className="text-center mt-8">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-forest-gold hover:text-amber-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回博客列表
                  </Link>
                </div>
              </ScrollReveal>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </ForestBackground>
  );
}