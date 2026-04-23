# PORTAL - 个人作品集网站

一个具有流畅动态视觉效果的个人作品集网站，展示项目、技术博客和个人信息。

## 特性

- **暗夜森林主题** - 深蓝灰背景配合暖金色强调色
- **玻璃拟态设计** - 半透明毛玻璃卡片效果
- **丰富交互** - 卡片悬停效果、滚动视差、诗意标语
- **主题切换** - 支持暗黑/明亮模式
- **全局搜索** - Cmd+K 快捷键快速搜索
- **阅读体验** - 文章目录导航、阅读进度条、代码复制
- **SEO优化** - 完整的元数据和站点地图

## 技术栈

- Next.js 16.2.4 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- next-themes

## 快速开始

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
personal_web/
├── app/              # 页面路由
├── components/       # React 组件
├── content/          # Markdown 内容
├── lib/              # 工具函数
└── public/           # 静态资源
```

## 内容管理

- 项目: `content/projects/*.md`
- 博客: `content/blog/*.md`
- 个人资料: `content/profile.md`

## 页面

- `/` - 首页
- `/about` - 关于
- `/projects` - 项目列表
- `/projects/[slug]` - 项目详情
- `/blog` - 博客列表
- `/blog/[slug]` - 博客详情
- `/login` - 登录

## 快捷键

- `Cmd+K` / `Ctrl+K` - 打开搜索

## License

MIT