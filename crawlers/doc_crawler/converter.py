"""HTML → Markdown 转换"""

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from markdownify import markdownify as md


class DocConverter:
    """将 HTML 文档转换为结构化的 Markdown"""

    def convert(self, html: str, url: str, config: dict) -> dict | None:
        """
        将 HTML 页面转为结构化的 Markdown 内容

        返回:
            {
                "title": "页面标题",
                "content": "Markdown 正文",
                "url": "来源 URL",
                "headings": ["章节1", "章节2"],
                "code_languages": ["python", "javascript"],
            }
        """
        soup = BeautifulSoup(html, "lxml")

        # 提取主要内容区域
        content_el = self._extract_content(soup, config)
        if not content_el:
            return None

        # 提取标题
        title = self._extract_title(soup, config)

        # 清理内容（移除导航、广告等无关元素）
        self._clean_content(content_el)

        # 转为 Markdown
        markdown_content = self._to_markdown(content_el, url)

        # 提取章节结构
        headings = self._extract_headings(markdown_content)

        # 提取代码语言
        code_languages = self._extract_code_languages(markdown_content)

        return {
            "title": title or url,
            "content": markdown_content,
            "url": url,
            "headings": headings,
            "code_languages": code_languages,
        }

    def _extract_content(self, soup: BeautifulSoup, config: dict):
        """提取主要内容区域"""
        content_selector = config.get("content_selector", "article")
        for selector in content_selector.split(","):
            selector = selector.strip()
            elements = soup.select(selector)
            if elements:
                return elements[0]
        # 兜底：找最大的 article 或 main
        for tag in ["article", "main", ".content", "#content", ".document"]:
            el = soup.select_one(tag)
            if el:
                return el
        return soup.body

    def _extract_title(self, soup: BeautifulSoup, config: dict) -> str:
        """提取页面标题"""
        title_selector = config.get("title_selector", "h1")
        el = soup.select_one(title_selector)
        if el:
            return el.get_text(strip=True)
        # 兜底从 <title> 取
        if soup.title:
            return soup.title.get_text(strip=True)
        return ""

    def _clean_content(self, element):
        """移除内容中的无关元素"""
        for selector in [
            "nav", "footer", "script", "style", "iframe",
            ".footer", ".navbar", ".toc", ".sidebar",
            ".edit-page", ".page-metadata",
            "[role=navigation]", "[role=search]",
        ]:
            for el in element.select(selector):
                el.decompose()

        # 移除空标签
        for el in element.find_all():
            if el.name in ("a", "span", "div") and not el.get_text(strip=True):
                el.decompose()

    def _to_markdown(self, element, base_url: str) -> str:
        """将 HTML 元素转为 Markdown"""
        # 将相对链接转为绝对链接
        for a in element.find_all("a", href=True):
            a["href"] = urljoin(base_url, a["href"])
        for img in element.find_all("img", src=True):
            img["src"] = urljoin(base_url, img["src"])

        html_str = str(element)
        # 配置 Markdownify
        markdown = md(
            html_str,
            heading_style="ATX",  # 使用 # 风格标题
            bullets="-",
            code_language_callback=self._detect_code_language,
            strip=["abbr", "data", "time", "address"],
        )
        # 清理多余空行
        markdown = re.sub(r"\n{4,}", "\n\n\n", markdown)
        markdown = markdown.strip()
        return markdown

    def _detect_code_language(self, element):
        """检测代码块语言"""
        for cls in element.get("class", []):
            if cls.startswith("language-"):
                return cls.replace("language-", "")
            if cls.startswith("lang-"):
                return cls.replace("lang-", "")
        # 尝试从 data-lang 属性获取
        lang = element.get("data-lang", "")
        if lang:
            return lang
        return ""

    def _extract_headings(self, markdown: str) -> list[str]:
        """从 Markdown 中提取标题层级"""
        headings = []
        for line in markdown.split("\n"):
            line = line.strip()
            if line.startswith("##") or line.startswith("# "):
                headings.append(line)
        return headings

    def _extract_code_languages(self, markdown: str) -> list[str]:
        """提取代码语言类型"""
        languages = set()
        for match in re.finditer(r"```(\w+)", markdown):
            lang = match.group(1)
            if lang not in ("", "text"):
                languages.add(lang)
        return sorted(languages)
