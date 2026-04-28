import { NextResponse } from "next/server";
import { getAllProjects, getAllBlogPosts } from "@/lib/markdown";

export async function GET() {
  try {
    const [projects, posts] = await Promise.all([
      getAllProjects(),
      getAllBlogPosts(),
    ]);

    const searchResults = [
      ...projects.map((p) => ({
        type: "project" as const,
        slug: p.slug,
        title: p.title,
        description: p.description,
      })),
      ...posts.map((p) => ({
        type: "blog" as const,
        slug: p.slug,
        title: p.title,
        description: p.description,
      })),
    ];

    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json([], { status: 500 });
  }
}