"""文档爬虫 Agent——爬取技术文档构建 RAG 知识库"""

import asyncio
import json
import logging
import sys
from pathlib import Path

# 确保能找到 config.py
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings
from doc_crawler.config import DOC_SITES
from doc_crawler.crawler import DocCrawler
from doc_crawler.converter import DocConverter
from doc_crawler.chunker import DocChunker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


class DocCrawlerAgent:
    """
    文档爬虫 Agent

    用法:
        agent = DocCrawlerAgent()
        # 爬取单个站点
        await agent.crawl_site("fastapi")
        # 爬取所有站点
        await agent.crawl_all()
        # 查看可用站点
        agent.list_sites()
    """

    def __init__(self):
        self.converter = DocConverter()
        self.chunker = DocChunker(min_chunk_size=100, max_chunk_size=3000)
        self.output_dir = Path(settings.doc_output_dir)

    def list_sites(self):
        """列出可爬取的文档站点"""
        print("\n可爬取的文档站点:")
        print("-" * 50)
        for key, site in DOC_SITES.items():
            print(f"  {key:<12} {site['name']:<20} {site['start_url']}")
        print()

    async def crawl_site(self, site_key: str, limit: int = 0):
        """爬取单个站点"""
        if site_key not in DOC_SITES:
            available = ", ".join(DOC_SITES.keys())
            logger.error(f"未知站点: {site_key}，可选: {available}")
            return

        site_config = DOC_SITES[site_key]
        logger.info(f"开始爬取: {site_config['name']} ({site_config['start_url']})")

        crawler = DocCrawler(site_config, delay=settings.request_delay)
        try:
            # 发现页面
            urls = await crawler.discover_urls()
            if limit > 0:
                urls = urls[:limit]
            logger.info(f"共发现 {len(urls)} 个页面")

            # 爬取页面
            pages = await crawler.crawl_all(urls)
            logger.info(f"成功爬取 {len(pages)} 个页面")

            # 转换 + 切片
            all_chunks = []
            success_count = 0
            for page in pages:
                try:
                    doc = self.converter.convert(page["html"], page["url"], site_config)
                    if doc and doc["content"].strip():
                        chunks = self.chunker.chunk_document(doc)
                        all_chunks.extend(chunks)
                        success_count += 1
                except Exception as e:
                    logger.warning(f"转换失败: {page['url']} - {e}")

            logger.info(f"成功转换 {success_count}/{len(pages)} 个页面")
            logger.info(f"生成 {len(all_chunks)} 个切片")

            # 保存
            self.chunker.save_chunks(all_chunks, str(self.output_dir), site_key)

        finally:
            await crawler.close()

    async def crawl_all(self, limit_per_site: int = 0):
        """爬取所有配置的站点"""
        for site_key in DOC_SITES:
            await self.crawl_site(site_key, limit=limit_per_site)


async def main():
    agent = DocCrawlerAgent()

    if len(sys.argv) < 2:
        agent.list_sites()
        print("用法: python -m doc_crawler.agent <site_key> [--limit N]")
        print("示例: python -m doc_crawler.agent fastapi --limit 10")
        return

    site = sys.argv[1]
    limit = 0
    if "--limit" in sys.argv:
        idx = sys.argv.index("--limit")
        if idx + 1 < len(sys.argv):
            limit = int(sys.argv[idx + 1])

    await agent.crawl_site(site, limit=limit)


if __name__ == "__main__":
    asyncio.run(main())
