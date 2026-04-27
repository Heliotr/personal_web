---
title: "第一次用Docker部署：从此告别、环境配置问题"
slug: "fastapi-docker-deployment"
description: "docker compose一键启动全栈服务，再也不用手动装环境了"
date: "2025-09-21"
tags:
  - "FastAPI"
  - "Docker"
  - "容器化"
  - "DevOps"
category: "技术分享"
readingTime: 8
---

## 01 部署之痛

之前每次上线都要：
1. 服务器安装Python 3.12
2. 安装PostgreSQL 16
3. 安装Redis
4. 装一堆pip依赖
5. 配置环境变量
6. 启动各个服务

有时候换个服务器，从零开始配置要一下午。而且QA环境、预发环境、生产环境配置不一致，还会出现"在我机器上能跑"的问题。

直到我学会了Docker...

## 02 Dockerfile

多阶段构建，开发和生产分开：

```dockerfile
FROM python:3.12-slim AS base
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 开发阶段
FROM base AS dev
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# 生产阶段
FROM base AS prod
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

```bash
# requirements.txt
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
sqlalchemy>=2.0.0
asyncpg>=0.29.0
redis>=5.0.0
```

## 03 docker-compose.yml

把所有服务编排在一起：

```yaml
version: "3.9"

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: blog_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s

  api:
    build:
      context: .
      target: dev
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - .:/app

  worker:
    build:
      context: .
      target: dev
    command: celery -A app.core.celery_app worker --loglevel=info
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  postgres_data:
```

## 04 环境变量

Docker内部网络用服务名：

```bash
# .env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/blog_db
REDIS_URL=redis://redis:6379/0
```

注意：
- `localhost` → `db`（服务名）
- `localhost` → `redis`（服务名）

## 05 启动！

```bash
# 一键启动所有服务
docker compose up --build

# 查看日志
docker compose logs -f api

# 停止
docker compose down
```

启动顺序自动管理：
1. 等db健康检查通过
2. 等redis健康检查通过
3. 启动api
4. 启动worker

## 06 我踩过的坑

### 坑1：数据没持久化
```yaml
# 错误：容器重启数据丢失
volumes:
  - /var/lib/postgresql/data  # 匿名卷

# 正确：命名卷持久化
volumes:
  - postgres_data:/var/lib/postgresql/data
```

### 坑2：depends_on不等待健康检查
```yaml
# 错误：只等容器启动，不等服务就绪
depends_on:
  - db

# 正确：等健康检查通过
depends_on:
  db:
    condition: service_healthy
```

### 坑3：Windows换行符
```bash
# 错误：Windows下CRLF导致脚本无法执行
docker-compose up  # 可能报错

# 正确：转成LF
sed -i 's/\r$//' docker-compose.yml
```

## 07 总结

1. **Docker Compose**一键启动，再也不手动配环境
2. **健康检查**保证依赖服务就绪再启动
3. **命名卷**持久化数据，重启不丢失
4. **多阶段构建**减小镜像体积

```bash
# 部署流程变得超级简单
git pull
docker compose up --build
# 搞定！
```

