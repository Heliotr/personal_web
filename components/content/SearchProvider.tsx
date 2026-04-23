"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getAllProjects, getAllBlogPosts } from "@/lib/markdown";

interface SearchResult {
  type: "project" | "blog";
  slug: string;
  title: string;
  description: string;
}

interface SearchContextType {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  results: SearchResult[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    async function loadData() {
      const projects = await getAllProjects();
      const posts = await getAllBlogPosts();

      const searchResults: SearchResult[] = [
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

      setResults(searchResults);
    }

    loadData();
  }, []);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);

  return (
    <SearchContext.Provider value={{ isOpen, openSearch, closeSearch, results }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}