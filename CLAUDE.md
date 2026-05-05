# 项目文档

## 项目概述

- **项目名称**: Helior的小破站 - 个人作品集网站
- **项目类型**: Next.js 全栈网站
- **描述**: 程序员个人作品集网站，展示项目、技术博客和个人信息
- **目标用户**: 招聘方、技术爱好者、潜在合作者

## 技术栈

- **框架**: Next.js 16.2.4 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **内容管理**: Markdown文件
- **主题**: next-themes (支持暗黑/明亮模式)
- **部署**: Vercel

## 项目结构

```
personal_web/
├── app/                      # Next.js 页面路由
│   ├── layout.tsx           # 根布局 (Inter字体, 暗夜森林主题)
│   ├── page.tsx             # 首页
│   ├── globals.css          # 全局样式 (暗夜森林主题色)
│   ├── about/               # 关于页面
│   ├── projects/            # 项目列表和详情
│   ├── blog/                # 博客列表和详情
│   ├── login/               # 登录页
│   ├── sitemap.ts           # SEO站点地图
│   └── robots.ts            # SEO robots.txt
│
├── components/
│   ├── ui/                  # UI组件
│   │   ├── GlassButton.tsx # 毛玻璃按钮
│   │   ├── GlassCard.tsx   # 毛玻璃卡片
│   │   ├── GlassTag.tsx    # 毛玻璃标签
│   │   └── ThemeToggle.tsx # 主题切换
│   │
│   ├── animations/
│   │   ├── ForestBackground.tsx # 森林背景+视差+松树剪影
│   │   ├── ScrollReveal.tsx
│   │   ├── TypewriterText.tsx
│   │   ├── GlitchText.tsx
│   │   ├── PageTransition.tsx
│   │   ├── ProgressBar.tsx      # 页面加载进度条
│   │   └── ReadingProgress.tsx # 阅读进度条
│   │
│   ├── layout/
│   │   ├── Header.tsx        # 导航栏
│   │   └── Footer.tsx        # 页脚
│   │
│   ├── content/
│   │   ├── SearchModal.tsx   # 搜索弹窗
│   │   ├── SearchProvider.tsx # 搜索上下文
│   │   ├── TableOfContents.tsx # 文章目录
│   │   └── CodeBlockCopy.tsx  # 代码复制按钮
│   │
│   └── sections/
│       ├── HeroSection.tsx   # 首页英雄区 + 诗意标语
│       ├── AboutSection.tsx  # 关于区块
│       ├── SkillsSection.tsx # 技能区块
│       ├── ProjectsSection.tsx
│       └── BlogSection.tsx
│
├── content/                 # Markdown内容
│   ├── profile.md          # 个人信息
│   ├── projects/           # 项目文档
│   │   ├── ai_office_assistant.md
│   │   └── personal_portfolio.md
│   └── blog/               # 博客文章
│       └── learning-journey.md
│
├── lib/
│   └── markdown.ts          # Markdown解析工具
│
├── crawlers/                # 自动化爬虫 Agent
│   ├── config.py           # 共享配置（API keys、输出目录）
│   ├── requirements.txt    # Python 依赖
│   ├── doc_crawler/        # 文档爬虫 Agent：爬技术文档 → Markdown → 智能切片 → RAG知识库
│   │   ├── agent.py       # 主入口，编排爬取/转换/切片/保存流程
│   │   ├── crawler.py     # httpx 爬取 + sitemap/导航链接发现
│   │   ├── converter.py   # HTML → Markdown 转换（markdownify）
│   │   ├── chunker.py     # 基于标题层级的智能切片引擎
│   │   └── config.py      # 目标站点配置（FastAPI/LangChain/LangGraph等）
│   ├── jd_crawler/        # JD 爬虫 Agent：爬 BOSS 直聘 → LLM提取 → 技能分析
│   │   ├── agent.py       # 主入口（crawl/analyze/crawl-and-analyze）
│   │   ├── browser.py     # Playwright 浏览器管理 + Cookie 持久化
│   │   ├── extractor.py   # LLM（Claude API）驱动的 JD 结构化提取 + 规则兜底
│   │   ├── analyzer.py    # 技能分析 + 可视化报告（Matplotlib）
│   │   ├── storage.py     # SQLite 存储 + 去重
│   │   └── config.py      # BOSS 直聘站点配置
│   └── knowledge/         # 已构建的文档知识库（.gitignore 忽略，需要本地爬取）
│
├── public/                  # 静态资源
    ├── images/              # 图片资源
    └── videos/              # 项目演示视频
```

## 关键文件

- `app/layout.tsx` - 根布局，定义字体和全局类
- `app/globals.css` - 暗夜森林主题CSS变量和工具类
- `components/animations/ForestBackground.tsx` - 视差滚动背景
- `components/sections/HeroSection.tsx` - 诗意标语展示
- `lib/markdown.ts` - 内容管理系统 (支持表格GFM)
- `components/content/SearchModal.tsx` - 全局搜索

## 已完成功能

### 视觉主题
- 暗夜森林主题 (#1a2a3a 深蓝灰背景)
- 暖金色强调色 (#f5a623)
- 玻璃拟态卡片 (backdrop-blur + 半透明)
- 大圆角设计 (卡片20px, 按钮12px)
- 松树剪影底部装饰
- 渐变网格背景 + 浮动光点
- 暗黑/明亮主题切换

### 页面功能
- 首页 - Hero区 + 关于 + 技能 + 项目预览 + 博客预览
- 关于页 - 个人资料卡片 + 技能展示 + 统计
- 项目列表 - 卡片网格布局 + 视频/图片缩略图
- 项目详情 - 技术栈 + 链接 + Markdown内容 + 截图展示 + 阅读进度条 + 演示视频 + 表格渲染
- 博客列表 - 左侧边栏 + 文章卡片 + 置顶文章标识 + 分类/标签筛选
- 博客详情 - 文章渲染 + 目录导航 + 代码复制 + 阅读进度条
- 登录页 - 登录表单占位页面

### 交互效果
- 卡片悬停上浮 + 边框高亮 + 阴影加深
- 诗意标语随机切换 (8秒)
- 滚动视差效果
- 图标悬停微动画
- 平滑页面过渡
- 页面加载进度条 (nprogress)
- 全局搜索 (Cmd+K 快捷键)

### SEO优化
- 页面SEO元数据 (title, description, keywords)
- Open Graph 社交分享卡片
- Twitter Card 支持
- 自动生成 sitemap.xml
- robots.txt 配置

### 访问分析
- Vercel Analytics (自动追踪页面访问、访客来源、设备数据等)

## 待优化项

### 低优先级
1. [ ] 添加评论区(需要后端)

## 内容管理

### 添加新项目
在 `content/projects/` 目录添加 `.md` 文件：
```markdown
---
title: "项目标题"
slug: "project-slug"
description: "简短描述"
date: "2024-03-15"
status: "completed" | "in-progress" | "archived"
featured: true
thumbnail: "/images/projects/xxx.png"
gif: "/videos/xxx.mp4"
techStack: ["React", "TypeScript"]
links:
  demo: "https://..."
  github: "https://..."
---

## 项目详情...
```

### 添加新博客
在 `content/blog/` 目录添加 `.md` 文件：
```markdown
---
title: "文章标题"
slug: "article-slug"
description: "文章摘要"
date: "2024-04-01"
tags: ["标签1", "标签2"]
category: "分类名"
readingTime: 10
pinned: true
---

## 文章内容...
```

### 修改个人信息
编辑 `content/profile.md` 文件

## 运行命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产
npm start

# Python 爬虫（进入 crawlers 目录）
cd crawlers
source venv/Scripts/activate       # 激活虚拟环境（Windows Git Bash）
python -m doc_crawler.agent fastapi                       # 爬取 FastAPI 文档
python -m doc_crawler.agent langchain                     # 爬取 LangChain 文档
python -m doc_crawler.agent langgraph                     # 爬取 LangGraph 文档
python -m doc_crawler.agent fastapi --limit 10            # 限制爬取页数
python -m jd_crawler.agent crawl --query "AI应用开发"      # 爬取 BOSS 直聘
python -m jd_crawler.agent crawl-and-analyze              # 爬取+分析
python -m jd_crawler.agent analyze                        # 仅分析已有数据
```

## 注意事项

1. 开发服务器运行在 http://localhost:3000
2. 主题色使用CSS变量定义在 globals.css 中
3. 动画组件使用 Framer Motion
4. 页面使用静态生成(SSG)需要运行 build 更新
5. 搜索功能支持 Cmd+K 快捷键打开

## 爬虫 Agent 说明

### 文档爬虫 Agent（crawlers/doc_crawler/）
爬取技术文档网站，构建个人 RAG 知识库。

**流程**: 发现 URL（sitemap）→ 并发爬取 HTML → 提取主要内容 → 转换 Markdown → 按标题层级切片 → 保存

**已爬取知识库**（存储在 `crawlers/knowledge/`，被 .gitignore 忽略，需本地运行生成）:
| 站点 | 页面数 | Chunks | Tokens |
|---|---|---|---|
| FastAPI | 152 | 2,910 | 777,556 |
| LangChain | 61 | 514 | 171,082 |
| LangGraph | 67 | 434 | 163,800 |

切片策略：以 h1/h2 为边界，保留父标题链作为上下文，合并过小段落（<50字符），代码块不被切断。

### JD 爬虫 Agent（crawlers/jd_crawler/）
爬取 BOSS 直聘招聘信息，LLM 驱动提取结构化字段，输出技能分析报告。

**流程**: Playwright 浏览器 → 手动登录（首次）→ Cookie 持久化 → 搜索列表页 → 进入详情页 → LLM 提取结构化字段 → SQLite 存储 → 技能统计 + 可视化报告

**首次使用**：
1. 在 `crawlers/.env` 中配置 `ANTHROPIC_API_KEY`
2. 运行 `python -m jd_crawler.agent crawl` 首次会打开浏览器，手动登录 BOSS 直聘
3. Cookie 自动保存，后续无需重复登录

### 技术选型
| 组件 | 文档爬虫 | JD 爬虫 |
|---|---|---|
| 爬取引擎 | httpx + BeautifulSoup | Playwright |
| 反爬 | 模拟 UA + 请求延迟 | Cookie持久化 + 人类行为模拟 |
| 内容提取 | CSS选择器 + markdownify | Claude API 结构化提取 + 规则兜底 |
| 存储 | Markdown文件 + JSON索引 | SQLite |
| 分析 | — | Matplotlib + Pandas |