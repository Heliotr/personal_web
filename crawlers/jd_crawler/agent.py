"""JD 爬虫 Agent——爬取招聘信息 + 技能分析"""

import asyncio
import json
import logging
import random
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings
from jd_crawler.config import BOSS_CONFIG, DEFAULT_SEARCH
from jd_crawler.browser import BrowserManager
from jd_crawler.extractor import JDExtractor, BatchExtractor
from jd_crawler.storage import JDStorage
from jd_crawler.analyzer import JDAnalyzer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


class JDCrawlerAgent:
    """
    JD 爬虫 Agent

    用法:
        agent = JDCrawlerAgent()
        # 爬取 BOSS 直聘
        await agent.crawl_boss(query="AI应用开发", city="北京", max_pages=5)
        # 分析已爬取的数据
        agent.analyze()
    """

    def __init__(self):
        self.storage = JDStorage()
        self.extractor = JDExtractor()
        self.batch_extractor = BatchExtractor(self.extractor)

    async def crawl_boss(self, query: str = "", city: str = "",
                          max_pages: int = 5, headless: bool = False):
        """爬取 BOSS 直聘"""
        query = query or DEFAULT_SEARCH["query"]
        city = city or DEFAULT_SEARCH["city"]
        max_pages = max_pages or DEFAULT_SEARCH["max_pages"]

        logger.info(f"开始爬取 BOSS 直聘: {query} - {city} (最多 {max_pages} 页)")

        browser = BrowserManager(cookie_file=BOSS_CONFIG["cookie_file"])
        try:
            page = await browser.start(headless=headless)

            # 确保已登录
            logged_in = await browser.ensure_logged_in(
                login_url=BOSS_CONFIG["login_url"],
                check_url=BOSS_CONFIG["base_url"],
            )
            if not logged_in:
                logger.error("登录失败，退出")
                return

            # 搜索
            search_url = f"{BOSS_CONFIG['search_url']}?query={query}&city={city}"
            logger.info(f"搜索: {search_url}")
            await page.goto(search_url, wait_until="networkidle")
            await asyncio.sleep(3)

            all_jds = []
            for page_num in range(1, max_pages + 1):
                logger.info(f"--- 第 {page_num} 页 ---")

                # 等待列表加载
                try:
                    await page.wait_for_selector(
                        BOSS_CONFIG["job_list_selector"], timeout=10000
                    )
                except Exception:
                    logger.warning("列表未加载，可能已到最后一页或需要登录")
                    break

                # 模拟人类滚动
                await browser.scroll_page()
                await browser.human_delay(1, 2)

                # 提取列表页信息
                page_jds = await self._extract_job_list(page, query, city)
                all_jds.extend(page_jds)
                logger.info(f"本页提取 {len(page_jds)} 条，累计 {len(all_jds)} 条")

                # 翻页
                if page_num < max_pages:
                    next_clicked = await self._click_next_page(page)
                    if not next_clicked:
                        logger.info("没有更多页面了")
                        break
                    await browser.human_delay(3, 5)

            logger.info(f"爬取完成，共 {len(all_jds)} 条 JD")

            # LLM 提取结构化信息
            logger.info("开始 LLM 结构化提取...")
            extracted = self.batch_extractor.extract_batch(all_jds)

            # 存储
            success, total = self.storage.save_batch(extracted)
            logger.info(f"已保存 {success}/{total} 条")

            return extracted

        finally:
            await browser.close()

    async def _extract_job_list(self, page, query: str, city: str) -> list[dict]:
        """从列表页提取 JD 信息"""
        jds = []

        try:
            cards = await page.query_selector_all(BOSS_CONFIG["job_list_selector"])
            for card in cards:
                try:
                    # 提取基本信息
                    title_el = await card.query_selector(BOSS_CONFIG["job_title_selector"])
                    company_el = await card.query_selector(BOSS_CONFIG["company_selector"])
                    salary_el = await card.query_selector(BOSS_CONFIG["salary_selector"])

                    title = await title_el.inner_text() if title_el else ""
                    company = await company_el.inner_text() if company_el else ""
                    salary = await salary_el.inner_text() if salary_el else ""

                    # 提取详情页链接
                    link_el = await card.query_selector(BOSS_CONFIG["detail_link_selector"])
                    url = ""
                    if link_el:
                        url = await link_el.get_attribute("href") or ""
                        if url and not url.startswith("http"):
                            url = BOSS_CONFIG["base_url"] + url

                    # 点击进入详情页提取完整 JD
                    raw_text = ""
                    if url:
                        raw_text = await self._extract_jd_detail(page, url)

                    jd = {
                        "title": title.strip(),
                        "company": company.strip(),
                        "salary": salary.strip(),
                        "url": url,
                        "raw_text": raw_text or f"{title} {company} {salary}",
                        "city": city,
                        "source": "BOSS直聘",
                        "crawled_at": datetime.now().isoformat(),
                    }
                    jds.append(jd)

                except Exception as e:
                    logger.warning(f"提取卡片失败: {e}")
                    continue

        except Exception as e:
            logger.warning(f"提取列表页失败: {e}")

        return jds

    async def _extract_jd_detail(self, page, url: str) -> str:
        """进入详情页提取完整 JD 文本"""
        try:
            await page.goto(url, wait_until="networkidle", timeout=15000)
            await asyncio.sleep(random.uniform(1, 2))

            # 尝试提取详情内容
            selectors = [
                ".job-sec-text",
                ".job-detail",
                ".detail-content",
                ".job-description",
                "article",
                "main",
            ]
            for selector in selectors:
                try:
                    el = await page.query_selector(selector)
                    if el:
                        text = await el.inner_text()
                        if len(text.strip()) > 50:
                            return text.strip()
                except Exception:
                    continue

            # 兜底：取页面 body 文本
            body_text = await page.evaluate("document.body.innerText")
            return body_text[:5000] if body_text else ""

        except Exception as e:
            logger.warning(f"提取详情失败: {url[:50]}... - {e}")
            return ""

    async def _click_next_page(self, page) -> bool:
        """点击下一页"""
        try:
            next_btn = await page.query_selector(".next, .page-next, [aria-label='下一页']")
            if next_btn:
                is_disabled = await next_btn.get_attribute("disabled")
                if is_disabled:
                    return False
                await next_btn.click()
                await asyncio.sleep(2)
                return True
            return False
        except Exception:
            return False

    def analyze(self, output_dir: str = ""):
        """分析已爬取的数据并生成报告"""
        records = self.storage.get_all()
        if not records:
            logger.warning("没有数据可分析")
            return

        output_dir = output_dir or settings.report_dir
        logger.info(f"分析 {len(records)} 条 JD 数据...")

        # 打印基本统计
        stats = self.storage.get_stats()
        print(f"\n📊 数据统计:")
        print(f"  • 总记录数: {stats['total']}")
        for source in stats.get("sources", []):
            print(f"  • 来源: {source[0]} = {source[1]} 条")
        print()

        # 生成分析报告
        analyzer = JDAnalyzer(records)
        report_path = analyzer.generate_report(output_dir)
        print(f"📄 报告已生成: {report_path}\n")

        # 打印核心结论
        skills = analyzer.skill_frequency()
        print("🏆 技能需求 Top 10:")
        for i, (skill, count) in enumerate(skills.most_common(10), 1):
            bar = "█" * int(count / max(skills.values()) * 20)
            print(f"  {i:2d}. {skill:<15} {bar} {count}")
        print()

        salary = analyzer.salary_stats()
        print(f"💰 薪资概览:")
        print(f"  平均范围: {salary['avg_min']}K - {salary['avg_max']}K")
        print(f"  样本数: {salary['sample_count']}")


async def main():
    agent = JDCrawlerAgent()

    if len(sys.argv) < 2:
        print("用法:")
        print("  python -m jd_crawler.agent crawl [--query 关键词] [--city 城市] [--pages N]")
        print("  python -m jd_crawler.agent analyze")
        print("  python -m jd_crawler.agent crawl-and-analyze [--query 关键词]")
        return

    command = sys.argv[1]

    if command == "crawl":
        query = _get_arg("--query", "AI应用开发")
        city = _get_arg("--city", "北京")
        pages = int(_get_arg("--pages", "5"))
        await agent.crawl_boss(query=query, city=city, max_pages=pages)

    elif command == "analyze":
        agent.analyze()

    elif command == "crawl-and-analyze":
        query = _get_arg("--query", "AI应用开发")
        city = _get_arg("--city", "北京")
        pages = int(_get_arg("--pages", "5"))
        await agent.crawl_boss(query=query, city=city, max_pages=pages)
        agent.analyze()

    else:
        print(f"未知命令: {command}")


def _get_arg(name: str, default: str = "") -> str:
    """从命令行参数获取值"""
    if name in sys.argv:
        idx = sys.argv.index(name)
        if idx + 1 < len(sys.argv):
            return sys.argv[idx + 1]
    return default


if __name__ == "__main__":
    asyncio.run(main())
