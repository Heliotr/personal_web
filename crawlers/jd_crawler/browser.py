"""Playwright 浏览器管理 + Cookie 持久化"""

import asyncio
import json
import logging
import random
import time
from pathlib import Path

logger = logging.getLogger(__name__)


class BrowserManager:
    """
    浏览器管理器，支持：
    - Cookie 持久化（首次需手动登录，后续自动加载）
    - 人机交互式登录等待
    - 行为模拟（随机延迟、滚动）
    """

    def __init__(self, cookie_file: str = "data/boss_cookies.json"):
        self.cookie_file = Path(cookie_file)
        self.cookie_file.parent.mkdir(parents=True, exist_ok=True)
        self.browser = None
        self.context = None
        self.page = None

    async def start(self, headless: bool = False):
        """启动浏览器"""
        from playwright.async_api import async_playwright

        self._playwright = await async_playwright().start()
        self.browser = await self._playwright.chromium.launch(
            headless=headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
            ],
        )

        # 加载已有 Cookie
        self.context = await self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )

        if self.cookie_file.exists():
            cookies = json.loads(self.cookie_file.read_text(encoding="utf-8"))
            await self.context.add_cookies(cookies)
            logger.info(f"已加载 {len(cookies)} 个 Cookie")

        self.page = await self.context.new_page()
        return self.page

    async def ensure_logged_in(self, login_url: str, check_url: str = ""):
        """
        确保已登录。如果 Cookie 无效，等待用户手动登录。

        参数:
            login_url: 登录页面 URL
            check_url: 登录后跳转的页面（用于判断是否已登录）
        """
        check_url = check_url or login_url

        # 先访问检查页
        await self.page.goto(check_url, wait_until="networkidle")
        await asyncio.sleep(2)

        # 判断是否跳回了登录页（未登录的特征）
        current_url = self.page.url
        if "login" in current_url.lower() or "passport" in current_url.lower():
            logger.warning("Cookie 已过期，需要手动登录")
            logger.info("请在打开的浏览器中完成登录...")
            logger.info("登录完成后，页面会自动保存 Cookie")

            await self.page.goto(login_url, wait_until="networkidle")

            # 等待用户手动登录（检测 URL 变化）
            max_wait = 120  # 最多等 2 分钟
            for i in range(max_wait):
                await asyncio.sleep(1)
                current = self.page.url
                if "login" not in current.lower() and "passport" not in current.lower():
                    logger.info("检测到登录成功")
                    await self._save_cookies()
                    return True

            logger.error("登录超时")
            return False

        logger.info("Cookie 有效，已登录状态")
        return True

    async def _save_cookies(self):
        """保存 Cookie 到文件"""
        cookies = await self.context.cookies()
        self.cookie_file.write_text(
            json.dumps(cookies, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        logger.info(f"已保存 {len(cookies)} 个 Cookie")

    async def human_delay(self, min_sec: float = 1.0, max_sec: float = 3.0):
        """随机延迟，模拟人类行为"""
        delay = random.uniform(min_sec, max_sec)
        await asyncio.sleep(delay)

    async def scroll_page(self):
        """模拟页面滚动"""
        await self.page.evaluate(
            """
            async () => {
                const distance = 400 + Math.random() * 600;
                window.scrollBy({ top: distance, behavior: 'smooth' });
            }
        """
        )
        await self.human_delay(0.5, 1.5)

    async def close(self):
        """关闭浏览器"""
        if self.context:
            await self._save_cookies()
        if self.browser:
            await self.browser.close()
        if self._playwright:
            await self._playwright.stop()
