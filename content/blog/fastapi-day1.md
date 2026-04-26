---
title: "我的第一个FastAPI项目：从小白到跑通API"
slug: "fastapi-first-project"
description: "手把手带你搭建FastAPI项目骨架，Pydantic真香警告"
date: "2025-08-17"
tags:
  - "FastAPI"
  - "Pydantic"
  - "入门教程"
category: "技术分享"
readingTime: 10
---

## 01 写在前面

终于开始学FastAPI了！之前用Flask写过小项目，这次要挑战一下更现代的框架。

本文记录我的第一个FastAPI项目是如何搭建的，以及遇到的那些坑。

## 02 项目初始化

按照国际惯例，先创项目结构：

```bash
mkdir -p blog_api/app/{api/v1,schemas,models,services,db,core}
cd blog_api
pip install fastapi uvicorn pydantic-settings
```

目录结构是这样的：

```
blog_api/
├── app/
│   ├── main.py           # 应用入口
│   ├── config.py         # 配置管理
│   ├── api/v1/           # 路由
│   ├── schemas/          # Pydantic模型
│   ├── models/           # ORM模型
│   └── services/         # 业务逻辑
├── .env
└── requirements.txt
```

## 03 配置管理

学到的第一件事：用`pydantic-settings`管理配置，告别硬编码：

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "BlogAPI"
    debug: bool = True
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/blog_db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "change-this-in-production"

    model_config = {"env_file": ".env"}

settings = Settings()
```

```bash
# .env
APP_NAME=BlogAPI
DEBUG=true
SECRET_KEY=my-secret-key-123
DATABASE_URL=postgresql+asyncpg://...
```

## 04 Pydantic也太香了吧

之前用Flask，参数验证要自己写一堆if判断。用Pydantic，定义好模型就行：

```python
# app/schemas/post.py
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class PostStatus(str, Enum):
    draft = "draft"
    published = "published"

class PostCreate(BaseModel):
    """创建文章的请求体验证"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category_id: int | None = None
    status: PostStatus = PostStatus.draft

class PostOut(BaseModel):
    """文章响应模型"""
    id: int
    title: str
    content: str
    status: PostStatus
    category_id: int | None
    author_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # 从ORM模型读取
```

**Field参数超好用**：
- `...` 表示必填
- `min_length`/`max_length` 字符串限制
- `ge`/`le` 数字限制
- `description` 自动生成文档

## 05 第一个API

写个最简单的文章CRUD：

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router as api_router

app = FastAPI(title="BlogAPI", version="1.0")

# CORS跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "BlogAPI is running"}
```

```python
# app/api/v1/posts.py
from fastapi import APIRouter, HTTPException
from app.schemas.post import PostCreate, PostOut

router = APIRouter(prefix="/posts", tags=["posts"])

# 内存存储（后续会接入数据库）
posts = []

@router.post("/", response_model=PostOut, status_code=201)
async def create_post(data: PostCreate):
    post = {
        "id": len(posts) + 1,
        **data.model_dump(),
        "author_id": 1,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00",
    }
    posts.append(post)
    return post

@router.get("/")
async def list_posts():
    return posts

@router.get("/{post_id}")
async def get_post(post_id: int):
    for post in posts:
        if post["id"] == post_id:
            return post
    raise HTTPException(status_code=404, detail="文章不存在")
```

## 06 启动项目

```bash
uvicorn app.main:app --reload
```

访问 `http://127.0.0.1:8000/docs`，Swagger UI 自动生成！

**我的内心**：这也太爽了吧！Flask还要装什么flask-restx才能有文档，FastAPI直接内置！

## 07 总结

1. **pydantic-settings** 管理配置，代码整洁
2. **Pydantic** 自动验证参数，自动生成文档
3. **response_model** 过滤返回字段，保证数据安全
4. **FastAPI自动生成Swagger**，接入方狂喜

## 下期预告

下篇讲如何接入PostgreSQL数据库，SQLAlchemy 2.0 async怎么用~