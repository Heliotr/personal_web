"use client";

import { useEffect } from "react";

export function CodeBlockCopy() {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll("pre");

      codeBlocks.forEach((pre) => {
        // 检查是否已经添加了复制按钮
        if (pre.parentElement?.querySelector(".copy-button")) return;

        // 创建复制按钮
        const button = document.createElement("button");
        button.className = "copy-button absolute top-2 right-2 px-2 py-1 text-xs bg-forest-card hover:bg-forest-gold hover:text-forest-darker text-forest-text-dim rounded transition-colors opacity-0 group-hover:opacity-100";
        button.textContent = "复制";

        // 包装pre元素
        const wrapper = document.createElement("div");
        wrapper.className = "relative group";

        pre.parentNode?.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        wrapper.appendChild(button);

        // 添加复制功能
        button.addEventListener("click", async () => {
          const code = pre.querySelector("code")?.textContent || pre.textContent || "";

          try {
            await navigator.clipboard.writeText(code);
            button.textContent = "已复制!";
            button.classList.add("text-forest-gold");

            setTimeout(() => {
              button.textContent = "复制";
              button.classList.remove("text-forest-gold");
            }, 2000);
          } catch (err) {
            console.error("复制失败:", err);
          }
        });
      });
    };

    // 初始加载时添加复制按钮
    addCopyButtons();

    // 监听DOM变化（用于动态加载的内容）
    const observer = new MutationObserver(() => {
      addCopyButtons();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}