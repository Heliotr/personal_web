"""文档爬虫配置——每个目标文档站的爬取规则"""

DOC_SITES = {
    "fastapi": {
        "name": "FastAPI",
        "start_url": "https://fastapi.tiangolo.com/",
        "sitemap": "https://fastapi.tiangolo.com/sitemap.xml",
        "allowed_prefixes": ["https://fastapi.tiangolo.com/"],
        "exclude_patterns": ["/blog/", "/resources/", "/help/", "/sponsors/"],
        "content_selector": "article",
        "title_selector": "h1",
        "sidebar_selector": "nav",
    },
    "langchain": {
        "name": "LangChain",
        "start_url": "https://docs.langchain.com/oss/python/langchain/overview",
        "sitemap": "https://docs.langchain.com/sitemap.xml",
        "allowed_prefixes": [
            "https://docs.langchain.com/oss/python/langchain/",
        ],
        "exclude_patterns": ["/blog/"],
        "content_selector": "article.docs-content, .prose, main",
        "title_selector": "h1",
        "sidebar_selector": ".sidebar, nav",
    },
    "langgraph": {
        "name": "LangGraph",
        "start_url": "https://docs.langchain.com/oss/python/langgraph/overview",
        "sitemap": "https://docs.langchain.com/sitemap.xml",
        "allowed_prefixes": [
            "https://docs.langchain.com/oss/python/langgraph/",
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
