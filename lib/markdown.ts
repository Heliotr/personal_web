import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export interface ProfileFrontmatter {
  name: string;
  title: string;
  avatar: string;
  bio: string;
  location: string;
  email: string;
  website?: string;
  social: {
    github: string;
    twitter?: string;
    linkedin?: string;
    bilibili?: string;
  };
  skills: {
    category: string;
    items: { name: string; level: number; icon?: string }[];
  }[];
  stats: {
    yearsExperience: number;
    projectsCompleted: number;
    linesOfCode: string;
  };
}

export interface ProjectFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  status: "completed" | "in-progress" | "archived";
  featured: boolean;
  thumbnail: string;
  gif?: string;
  screenshots?: string[];
  techStack: string[];
  links?: {
    demo?: string;
    github?: string;
    documentation?: string;
  };
  highlights: string[];
}

export interface BlogFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  tags: string[];
  category: string;
  readingTime: number;
  coverImage?: string;
  series?: string;
  seriesOrder?: number;
  pinned?: boolean;
}

export async function getMarkdownContent(
  filePath: string
): Promise<{ data: Record<string, unknown>; content: string; html: string }> {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return { data, content, html: contentHtml };
}

export async function getProfile() {
  try {
    const filePath = path.join(contentDirectory, "profile.md");
    const { data, html } = await getMarkdownContent(filePath);
    return { ...data, bioHtml: html } as ProfileFrontmatter & { bioHtml: string };
  } catch {
    return null;
  }
}

export async function getAllProjects() {
  try {
    const projectsDir = path.join(contentDirectory, "projects");
    const filenames = fs.readdirSync(projectsDir);

    const projects = await Promise.all(
      filenames
        .filter((f) => f.endsWith(".md"))
        .map(async (filename) => {
          const slug = filename.replace(".md", "");
          const filePath = path.join(projectsDir, filename);
          const { data } = await getMarkdownContent(filePath);
          return { ...data, slug } as ProjectFrontmatter & { slug: string };
        })
    );

    return projects.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string) {
  const filePath = path.join(contentDirectory, "projects", `${slug}.md`);
  const { data, html } = await getMarkdownContent(filePath);
  return { ...data, contentHtml: html } as ProjectFrontmatter & { contentHtml: string };
}

export async function getAllBlogPosts() {
  try {
    const blogDir = path.join(contentDirectory, "blog");
    const filenames = fs.readdirSync(blogDir);

    const posts = await Promise.all(
      filenames
        .filter((f) => f.endsWith(".md"))
        .map(async (filename) => {
          const slug = filename.replace(".md", "");
          const filePath = path.join(blogDir, filename);
          const { data } = await getMarkdownContent(filePath);
          return { ...data, slug } as BlogFrontmatter & { slug: string };
        })
    );

    return posts.sort((a, b) => {
      // 置顶文章排在前面
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  } catch {
    return [];
  }
}

export async function getBlogPostBySlug(slug: string) {
  const filePath = path.join(contentDirectory, "blog", `${slug}.md`);
  const { data, content, html } = await getMarkdownContent(filePath);
  return { ...data, content, contentHtml: html } as BlogFrontmatter & { content: string; contentHtml: string };
}