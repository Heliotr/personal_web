import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ProgressBar } from "@/components/animations/ProgressBar";
import { Providers } from "@/components/Providers";
import { CodeBlockCopy } from "@/components/content/CodeBlockCopy";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cat111.cn"),
  title: {
    default: "PORTAL | 个人作品集",
    template: "%s | PORTAL",
  },
  description: "探索我的编程世界 - 项目作品与技术博客",
  keywords: ["程序员", "作品集", "个人网站", "技术博客", "前端开发", "全栈开发"],
  authors: [{ name: "PORTAL" }],
  creator: "PORTAL",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://www.cat111.cn",
    siteName: "PORTAL",
    title: "PORTAL | 个人作品集",
    description: "探索我的编程世界 - 项目作品与技术博客",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PORTAL 个人作品集",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PORTAL | 个人作品集",
    description: "探索我的编程世界 - 项目作品与技术博客",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-forest-bg text-forest-text font-sans antialiased transition-colors duration-300">
        <Providers>
          <CodeBlockCopy />
          <ProgressBar />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}