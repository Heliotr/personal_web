import { getAllBlogPosts, getProfile } from "@/lib/markdown";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ForestBackground } from "@/components/animations/ForestBackground";
import { BlogContent } from "./BlogContent";

export default async function BlogPage() {
  const profile = await getProfile();
  const posts = await getAllBlogPosts();

  return (
    <ForestBackground>
      <Header />
      <main className="relative pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <BlogContent posts={posts} profile={profile} />
        </div>
      </main>
      <Footer />
    </ForestBackground>
  );
}