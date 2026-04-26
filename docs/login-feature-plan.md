# 登录注册功能实现计划

## 背景
用户希望在个人作品集网站中添加登录注册功能，支持：
1. 手机号验证码登录
2. GitHub OAuth 登录

当前项目是纯静态 Next.js 网站，没有认证系统。

---

## 推荐方案

### 技术选型

| 功能 | 推荐方案 | 理由 |
|------|----------|------|
| 认证框架 | Auth.js v5 (原 NextAuth) | 原生支持 Next.js App Router，GitHub Provider 即装即用 |
| 数据库 | Vercel Postgres | 免费额度足够，部署简单，Auth.js 有官方 Prisma 适配器 |
| ORM | Prisma | 类型安全，与 TypeScript 完美配合 |
| 短信服务 | 阿里云短信 | 国内到达率高，价格便宜 (~0.045元/条) |

---

## 实现步骤

### Phase 1: 基础设施
1. 安装依赖：`next-auth`、`@auth/prisma-adapter`、`@prisma/client`、`@vercel/postgres`、`zod`
2. 在 Vercel 创建 Postgres 数据库
3. 编写 Prisma schema（用户、验证码、登录日志等模型）
4. 配置环境变量

### Phase 2: Auth.js 配置
1. 创建 `lib/auth.ts` - 配置 GitHub Provider + Credentials Provider
2. 创建 `app/api/auth/[...nextauth]/route.ts`
3. 修改 `components/Providers.tsx` 添加 SessionProvider
4. 创建 `middleware.ts` 保护管理后台

### Phase 3: GitHub 登录
1. 在 GitHub 创建 OAuth App
2. 配置环境变量
3. 更新登录页面 UI

### Phase 4: 手机验证码登录
1. 申请阿里云短信服务（签名+模板）
2. 实现短信发送服务 `lib/sms.ts`
3. 创建发送验证码 API
4. 创建手机登录 API
5. 实现登录表单组件（60秒倒计时、防刷限制）

### Phase 5: 管理后台
1. 创建受保护的 admin 路由组
2. 仪表盘、博客管理、项目管理页面
3. 修改 Header 显示登录状态

---

## 关键文件

| 文件 | 作用 |
|------|------|
| `lib/auth.ts` | Auth.js 核心配置 |
| `app/api/auth/[...nextauth]/route.ts` | 认证 API 路由 |
| `app/login/page.tsx` | 登录页面（重构） |
| `components/Providers.tsx` | 添加 SessionProvider |
| `components/layout/Header.tsx` | 显示登录状态 |
| `middleware.ts` | 路由保护 |
| `prisma/schema.prisma` | 数据库模型 |

---

## 环境变量

```env
# 数据库
POSTGRES_URL="postgres://..."

# Auth.js
AUTH_SECRET="32位随机字符串"
AUTH_URL="https://www.cat111.cn"

# GitHub OAuth
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"

# 阿里云短信
ALIYUN_ACCESS_KEY_ID="xxx"
ALIYUN_ACCESS_KEY_SECRET="xxx"
ALIYUN_SMS_SIGN_NAME="你的签名"
ALIYUN_SMS_TEMPLATE_CODE="SMS_xxx"

# 管理员手机号
ADMIN_PHONE="13800138000"
```

---

## 验证方法

1. **本地测试**：
   - `npm run dev` 启动开发服务器
   - 访问 `/login` 页面
   - 测试 GitHub 登录按钮跳转
   - 测试手机验证码发送（需要真手机号或模拟）
   - 登录后访问 `/admin` 验证权限保护

2. **部署后测试**：
   - 在 Vercel 配置环境变量
   - 使用生产域名测试 OAuth 回调
   - 验证登录状态在页面间持久化

---

## 工作量估算

- 基础设施：2-3 小时
- Auth.js 配置：2 小时
- GitHub 登录：1 小时
- 手机验证码：3-4 小时
- 管理后台：4-5 小时
- 测试部署：1-2 小时

**总计：约 13-17 小时**