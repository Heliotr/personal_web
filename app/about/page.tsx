import { getProfile } from "@/lib/markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";

export default async function AboutPage() {
  const profile = await getProfile();

  if (!profile) {
    return <div>加载失败</div>;
  }

  return (
    <ForestBackground>
      <Header />
      <main className="relative pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h1 className="text-3xl font-semibold text-forest-gold mb-8">关于我</h1>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="md:col-span-1">
                <div className="md:sticky md:top-24">
                  <GlassCard className="p-8 text-center">
                    <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-forest-gold/30 to-forest-accent/30 flex items-center justify-center">
                      <span className="text-5xl font-bold text-forest-gold">
                        {profile.name.charAt(0)}
                      </span>
                    </div>
                    <h2 className="text-xl font-medium text-forest-text mb-1">
                      {profile.name}
                    </h2>
                    <p className="text-forest-accent mb-4">{profile.title}</p>
                    <p className="text-sm text-forest-text-dim mb-4 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </p>

                    <div className="flex justify-center gap-4 pt-4 border-t border-forest-border/30">
                      {profile.social.github && (
                        <a
                          href={profile.social.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-text-dim hover:text-forest-gold transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                        </a>
                      )}
                      {profile.social.twitter && (
                        <a
                          href={profile.social.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest-text-dim hover:text-forest-gold transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </ScrollReveal>

            <div className="md:col-span-2 space-y-6">
              <ScrollReveal delay={0.2}>
                <GlassCard className="p-6">
                  <h3 className="text-lg font-medium text-forest-gold mb-4">个人简介</h3>
                  <div className="text-forest-text-dim leading-relaxed whitespace-pre-line">
                    {profile.bio}
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <GlassCard className="p-6">
                  <h3 className="text-lg font-medium text-forest-gold mb-4">技能专长</h3>
                  <div className="space-y-6">
                    {profile.skills.map((category) => (
                      <div key={category.category}>
                        <p className="text-sm text-forest-text-dim mb-3">{category.category}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {category.items.map((skill) => (
                            <div
                              key={skill.name}
                              className="flex items-center justify-between p-3 bg-forest-card rounded-lg"
                            >
                              <span className="text-sm text-forest-text">{skill.name}</span>
                              <span className="text-sm text-forest-gold font-medium">{skill.level}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.4}>
                <GlassCard className="p-6">
                  <h3 className="text-lg font-medium text-forest-gold mb-4">数据统计</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 glass rounded-card">
                      <div className="text-2xl font-bold text-forest-gold">
                        {profile.stats.yearsExperience}+
                      </div>
                      <div className="text-xs text-forest-text-dim mt-1">年经验</div>
                    </div>
                    <div className="text-center p-4 glass rounded-card">
                      <div className="text-2xl font-bold text-forest-gold">
                        {profile.stats.projectsCompleted}+
                      </div>
                      <div className="text-xs text-forest-text-dim mt-1">项目</div>
                    </div>
                    <div className="text-center p-4 glass rounded-card">
                      <div className="text-2xl font-bold text-forest-gold">
                        {profile.stats.linesOfCode}
                      </div>
                      <div className="text-xs text-forest-text-dim mt-1">代码行</div>
                    </div>
                    <div className="text-center p-4 glass rounded-card">
                      <div className="text-2xl font-bold text-forest-gold">
                        1000+
                      </div>
                      <div className="text-xs text-forest-text-dim mt-1">咖啡杯</div>
                    </div>
                  </div>
                </GlassCard>
              </ScrollReveal>
            </div>
          </div>

          <ScrollReveal delay={0.5}>
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