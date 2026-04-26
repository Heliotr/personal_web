import { getProfile, getAllProjects, getAllBlogPosts } from "@/lib/markdown";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { BlogSection } from "@/components/sections/BlogSection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";

export default async function Home() {
  const profile = await getProfile();
  const projects = await getAllProjects();
  const posts = await getAllBlogPosts();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-forest-red">加载数据失败</p>
      </div>
    );
  }

  return (
    <ForestBackground>
      <Header />
      <main className="relative">
        <HeroSection />
        <AboutSection
          name={profile.name}
          title={profile.title}
          bio={profile.bio}
          avatar={profile.avatar}
          stats={profile.stats}
        />
        <SkillsSection skills={profile.skills} />
        <ProjectsSection projects={projects} />
        <BlogSection posts={posts} />
      </main>
      <Footer />
    </ForestBackground>
  );
}