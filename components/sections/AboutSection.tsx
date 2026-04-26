"use client";

import { ScrollReveal } from "../animations/ScrollReveal";
import { GlassCard } from "../ui/GlassCard";

interface AboutSectionProps {
  name: string;
  title: string;
  bio: string;
  avatar?: string;
  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    linesOfCode: string;
  };
}

export function AboutSection({ name, title, bio, avatar, stats }: AboutSectionProps) {
  const statItems = [
    { label: "年经验", value: stats.yearsExperience },
    { label: "项目", value: stats.projectsCompleted },
    { label: "代码", value: stats.linesOfCode },
  ];

  return (
    <section id="about" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-forest-gold mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-forest-gold rounded-full" />
            关于我
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <ScrollReveal delay={0.1}>
            <GlassCard className="p-8 text-center">
              {avatar ? (
                <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden border-2 border-forest-gold/30">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-forest-gold/30 to-forest-accent/30 flex items-center justify-center">
                  <span className="text-4xl font-bold text-forest-gold">
                    {name.charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="text-lg font-medium text-forest-text mb-1">{name}</h3>
              <p className="text-forest-accent">{title}</p>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="space-y-4">
              <p className="text-forest-text-dim leading-relaxed">
                {bio.split('\n').slice(0, 4).join('\n')}
              </p>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {statItems.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 glass rounded-card"
                  >
                    <div className="text-2xl font-bold text-forest-gold mb-1">
                      {stat.value}+
                    </div>
                    <div className="text-xs text-forest-text-dim">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}