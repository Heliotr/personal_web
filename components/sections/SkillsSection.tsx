"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "../animations/ScrollReveal";
import { GlassCard } from "../ui/GlassCard";

interface SkillsSectionProps {
  skills: {
    category: string;
    items: { name: string; level: number }[];
  }[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section id="skills" className="py-20 px-6 bg-forest-darker/30">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-forest-gold mb-8 flex items-center gap-3">
            <span className="w-1 h-6 bg-forest-gold rounded-full" />
            技能专长
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6">
          {skills.map((category, catIndex) => (
            <ScrollReveal key={category.category} delay={catIndex * 0.1}>
              <GlassCard className="p-6">
                <h3 className="text-base font-medium text-forest-text mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest-gold" />
                  {category.category}
                </h3>
                <div className="space-y-4">
                  {category.items.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-forest-text-dim">{skill.name}</span>
                        <span className="text-sm text-forest-gold">{skill.level}%</span>
                      </div>
                      <div className="h-2 bg-forest-card rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-forest-gold to-amber-400 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}