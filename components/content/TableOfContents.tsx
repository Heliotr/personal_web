"use client";

import { useEffect, useState } from "react";

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentHtml: string;
}

export function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 从HTML内容中提取标题
    const parser = new DOMParser();
    const doc = parser.parseFromString(contentHtml, "text/html");
    const h2Elements = doc.querySelectorAll("h2, h3");

    const items: TOCItem[] = Array.from(h2Elements).map((el, index) => {
      const id = `heading-${index}`;
      return {
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName.charAt(1)),
      };
    });

    setHeadings(items);

    // 监听滚动以更新当前激活的标题
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    // 给标题元素添加ID
    items.forEach((item, index) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [contentHtml]);

  if (headings.length === 0) {
    return null;
  }

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="sticky top-24">
      <h4 className="text-sm font-medium text-forest-gold mb-3">目录</h4>
      <ul className="space-y-2">
        {headings.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
          >
            <button
              onClick={() => scrollToHeading(item.id)}
              className={`text-xs text-left transition-colors hover:text-forest-gold ${
                activeId === item.id
                  ? "text-forest-gold font-medium"
                  : "text-forest-text-dim"
              }`}
            >
              {item.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}