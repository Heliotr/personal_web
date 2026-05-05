"""页面爬取 + 链接发现"""

import asyncio
import re
import time
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from loguru import logger


class DocCrawler:
    """文档站点爬虫，支持 sitemap 发现和页面爬取"""

    def __init__(self, config: dict, delay: float = 0.5):
        self.config = config
        self.delay = delay
        self.visited_urls: set[str] = set()
        self.client = httpx.AsyncClient(
            follow_redirects=True,
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36",
            },
        )

    async def close(self):
        await self.client.aclose()

    def _should_crawl(self, url: str) -> bool:
        """判断 URL 是否在爬取范围内"""
        # 检查是否在允许前缀内
        allowed = any(
            url.startswith(prefix) for prefix in self.config["allowed_prefixes"]
        )
        if not allowed:
            return False
        # 检查排除模式
        for pattern in self.config.get("exclude_patterns", []):
            if pattern in url:
                return False
        # 排除非文档文件
        ext = urlparse(url).path.rsplit(".", 1)[-1] if "." in urlparse(url).path else ""
        if ext.lower() in ("pdf", "zip", "png", "jpg", "jpeg", "gif", "svg", "ico"):
            return False
        return True

    async def fetch_page(self, url: str) -> str | None:
        """抓取单个页面"""
        try:
            response = await self.client.get(url)
            response.raise_for_status()
            return response.text
        except httpx.HTTPStatusError as e:
            logger.warning(f"HTTP error {e.response.status_code}: {url}")
            return None
        except httpx.RequestError as e:
            logger.warning(f"Request failed: {url} - {e}")
            return None

    async def discover_from_sitemap(self) -> set[str]:
        """从 sitemap.xml 发现所有文档 URL"""
        sitemap_url = self.config.get("sitemap")
        if not sitemap_url:
            return set()

        html = await self.fetch_page(sitemap_url)
        if not html:
            logger.warning(f"无法获取 sitemap: {sitemap_url}")
            return set()

        urls = set()
        soup = BeautifulSoup(html, "xml" if "xml" in html[:200] else "lxml")
        for loc in soup.find_all("loc"):
            url = loc.get_text(strip=True)
            if self._should_crawl(url):
                urls.add(url)

        logger.info(f"从 sitemap 发现 {len(urls)} 个页面")
        return urls

    async def discover_from_navigation(self, start_url: str) -> set[str]:
        """从导航栏发现链接（sitemap 找不到时的备选）"""
        html = await self.fetch_page(start_url)
        if not html:
            return set()

        soup = BeautifulSoup(html, "lxml")
        urls = set()
        # 优先从侧边栏和导航中找链接
        nav_selectors = self.config.get("sidebar_selector", "nav")
        nav_elements = soup.select(nav_selectors) if nav_selectors else []
        if not nav_elements:
            nav_elements = soup.find_all(["nav", "aside"])

        for nav in nav_elements:
            for a in nav.find_all("a", href=True):
                href = a["href"]
                full_url = urljoin(start_url, href)
                if self._should_crawl(full_url) and "#" not in href:
                    urls.add(full_url)

        # 如果导航发现太少，从页面所有链接中过滤
        if len(urls) < 10:
            for a in soup.find_all("a", href=True):
                href = a["href"]
                full_url = urljoin(start_url, href)
                if self._should_crawl(full_url) and "#" not in href:
                    urls.add(full_url)

        logger.info(f"从导航发现 {len(urls)} 个页面")
        return urls

    async def discover_urls(self) -> list[str]:
        """发现所有需要爬取的 URL"""
        urls = await self.discover_from_sitemap()
        if not urls:
            logger.info("sitemap 未发现页面，尝试从导航发现")
            urls = await self.discover_from_navigation(self.config["start_url"])
        return sorted(urls)

    async def crawl_all(self, urls: list[str]) -> list[dict]:
        """爬取所有页面，返回结构化数据"""
        results = []
        total = len(urls)

        for i, url in enumerate(urls):
            if url in self.visited_urls:
                continue
            self.visited_urls.add(url)

            logger.info(f"[{i+1}/{total}] 爬取: {url}")
            html = await self.fetch_page(url)
            if html:
                results.append({"url": url, "html": html})
            await asyncio.sleep(self.delay)

        return results
