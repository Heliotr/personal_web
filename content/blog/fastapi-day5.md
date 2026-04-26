---
title: "接口慢到超时？Redis缓存和Celery救了我"
slug: "fastapi-redis-celery-optimization"
description: "从10秒到100毫秒，我的性能优化实战，异步任务搞定耗时操作"
date: "2025-09-14"
tags:
  - "FastAPI"
  - "Redis"
  - "Celery"
  - "性能优化"
category: "技术分享"
readingTime: 10
---

## 01 惨烈的性能问题

上线第一天，运营同事就投诉了：
- 文章列表接口响应10秒+
- 用户评论后页面卡住3秒没反应

排查发现：
1. 文章列表每次都查数据库，没缓存
2. 评论成功还要发邮件，串行执行

这就是没有缓存和异步任务的后果！

## 02 Redis缓存

启动Redis：
```bash
docker run -d --name blog-redis -p 6379:6379 redis:7-alpine
```

封装Redis操作：
```python
# app/core/cache.py
import json
import redis.asyncio as aioredis
from app.config import settings

redis_client = aioredis.from_url(settings.redis_url, decode_responses=True)

async def get_cache(key: str):
    data = await redis_client.get(key)
    return json.loads(data) if data else None

async def set_cache(key: str, value: any, expire: int = 300):
    await redis_client.set(key, json.dumps(value), ex=expire)

async def delete_cache(key: str):
    await redis_client.delete(key)
```

改造Service层：
```python
# app/services/post_service.py
async def get_post(db: AsyncSession, post_id: int):
    # 1. 先查缓存
    cache_key = f"post:{post_id}"
    cached = await get_cache(cache_key)
    if cached:
        return cached
    
    # 2. 缓存未命中，查数据库
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    
    # 3. 写入缓存
    if post:
        await set_cache(cache_key, {"id": post.id, "title": post.title}, expire=600)
    
    return post

async def update_post(db: AsyncSession, post: Post, data: PostUpdate):
    # 更新后删除缓存
    await delete_cache(f"post:{post.id}")
    # ...
```

**效果**：响应时间从10秒降到100毫秒！

## 03 浏览量计数器

用Redis的INCR原子操作，扛高并发：

```python
async def increment_view_count(db: AsyncSession, post_id: int):
    cache_key = f"post:views:{post_id}"
    views = await redis_client.incr(cache_key)
    
    # 每10次同步到数据库
    if views % 10 == 0:
        await db.execute(
            update(Post).where(Post.id == post_id).values(view_count=views)
        )
        await db.commit()
```

## 04 Celery异步任务

安装：
```bash
pip install celery redis
```

配置：
```python
# app/core/celery_app.py
from celery import Celery
from app.config import settings

celery_app = Celery("blog_worker", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)
```

定义任务：
```python
# app/tasks/notification.py
import time
from app.core.celery_app import celery_app

@celery_app.task
def send_new_comment_notification(post_author_email: str, commenter: str, post_title: str):
    """异步发送邮件通知"""
    time.sleep(3)  # 模拟发邮件耗时
    print(f"邮件已发送到 {post_author_email}")
    return {"status": "sent"}
```

触发任务：
```python
# app/services/comment_service.py
async def create_comment(db: AsyncSession, post_id: int, author_id: int, data: CommentCreate):
    comment = Comment(**data.model_dump(), post_id=post_id, author_id=author_id)
    db.add(comment)
    await db.commit()
    
    # 异步发送通知，不阻塞主流程
    post = await post_service.get_post(db, post_id)
    if post and post.author_id != author_id:
        send_new_comment_notification.delay(
            post_author_email=f"{post.author_id}@example.com",
            commenter="用户",
            post_title=post.title
        )
    
    return comment
```

启动Worker：
```bash
celery -A app.core.celery_app worker --loglevel=info
```

**效果**：评论接口从3秒变成100毫秒，邮件在后台慢慢发。

## 05 缓存三大坑

### 缓存穿透
请求一个不存在的key，每次都打数据库。

**解决方案**：缓存空值或布隆过滤器

### 缓存击穿
热点key过期，瞬间大量请求打过来。

**解决方案**：互斥锁或永不过期

### 缓存雪崩
大量key同时过期。

**解决方案**：随机TTL

## 06 总结

1. **Redis缓存**让接口飞起来，10秒→100毫秒
2. **缓存记得删除**，更新时清缓存
3. **Celery异步任务**不阻塞用户，3秒→100毫秒
4. **INCR计数**抗高并发，比数据库UPDATE快

```python
# 性能优化组合拳
# 1. 读：缓存 → 数据库
# 2. 写：数据库 → 删除缓存 → 异步任务
# 3. 计数：Redis INCR → 批量同步
```

## 下期预告

怎么把服务部署到服务器？Docker Compose一键启动了解一下~