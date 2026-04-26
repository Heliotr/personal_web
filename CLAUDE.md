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
│   │   ├── pixel-game-engine.md
│   │   └── ai-code-assistant.md
│   └── blog/               # 博客文章
│       └── learning-journey.md
│
├── lib/
│   └── markdown.ts          # Markdown解析工具
└── public/                  # 静态资源
```

## 关键文件

- `app/layout.tsx` - 根布局，定义字体和全局类
- `app/globals.css` - 暗夜森林主题CSS变量和工具类
- `components/animations/ForestBackground.tsx` - 视差滚动背景
- `components/sections/HeroSection.tsx` - 诗意标语展示
- `lib/markdown.ts` - 内容管理系统
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
- 项目列表 - 卡片网格布局
- 项目详情 - 技术栈 + 链接 + Markdown内容 + 截图展示 + 阅读进度条
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
```

## 注意事项

1. 开发服务器运行在 http://localhost:3000
2. 主题色使用CSS变量定义在 globals.css 中
3. 动画组件使用 Framer Motion
4. 页面使用静态生成(SSG)需要运行 build 更新
5. 搜索功能支持 Cmd+K 快捷键打开