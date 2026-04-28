"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";
import { SearchProvider } from "@/components/content/SearchProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SearchProvider>
        {children}
      </SearchProvider>
    </ThemeProvider>
  );
}