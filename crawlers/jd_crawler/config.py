"""JD 爬虫配置——招聘网站搜索参数"""

# BOSS 直聘搜索配置
BOSS_CONFIG = {
    "name": "BOSS直聘",
    "base_url": "https://www.zhipin.com",
    "search_url": "https://www.zhipin.com/web/geek/job",
    "login_url": "https://www.zhipin.com/web/user/?ka=header-login",
    "cookie_file": "data/boss_cookies.json",
    # 搜索参数
    "job_list_selector": ".job-card-wrapper, .job-list-item",
    "job_title_selector": ".job-name, .job-title",
    "company_selector": ".company-name, .company-text",
    "salary_selector": ".salary, .job-salary",
    "detail_link_selector": "a.job-card-link, a.job-title",
}

# 猎聘配置
LIEPIN_CONFIG = {
    "name": "猎聘",
    "base_url": "https://www.liepin.com",
    "search_url": "https://www.liepin.com/zhaopin/",
    "cookie_file": "data/liepin_cookies.json",
}

# 默认搜索参数
DEFAULT_SEARCH = {
    "query": "AI应用开发",
    "city": "北京",
    "max_pages": 5,
}
