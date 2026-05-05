"""文档爬虫配置——每个目标文档站的爬取规则"""

DOC_SITES = {
    "fastapi": {
        "name": "FastAPI",
        "start_url": "https://fastapi.tiangolo.com/",
        "sitemap": "https://fastapi.tiangolo.com/sitemap.xml",
        "allowed_prefixes": ["https://fastapi.tiangolo.com/"],
        # 排除非文档页面
        "exclude_patterns": ["/blog/", "/resources/", "/help/", "/sponsors/"],
        "content_selector": "article",
        "title_selector": "h1",
        "sidebar_selector": "nav",
    },
    "langchain": {
        "name": "LangChain",
        "start_url": "https://python.langchain.com/docs/",
        "sitemap": "https://python.langchain.com/sitemap.xml",
        "allowed_prefixes": [
            "https://python.langchain.com/docs/",
            "https://python.langchain.com/api/",
        ],
        "exclude_patterns": [
            "/blog/",
            "/blog/",
            # 排除太多细节的 API 文档
        ],
        "content_selector": "article.docs-content, .prose",
        "title_selector": "h1",
        "sidebar_selector": ".sidebar, nav",
    },
    "langgraph": {
        "name": "LangGraph",
        "start_url": "https://langchain-ai.github.io/langgraph/",
        "sitemap": "https://langchain-ai.github.io/langgraph/sitemap.xml",
        "allowed_prefixes": [
            "https://langchain-ai.github.io/langgraph/"
        ],
        "exclude_patterns": ["/blog/"],
        "content_selector": "article, main",
        "title_selector": "h1",
        "sidebar_selector": "nav",
    },
    "claude_api": {
        "name": "Claude API",
        "start_url": "https://docs.anthropic.com/en/docs",
        "sitemap": "https://docs.anthropic.com/sitemap.xml",
        "allowed_prefixes": [
            "https://docs.anthropic.com/en/docs",
            "https://docs.anthropic.com/en/api",
        ],
        "exclude_patterns": ["/blog/"],
        "content_selector": "article, .content, main",
        "title_selector": "h1",
        "sidebar_selector": "nav",
    },
}
