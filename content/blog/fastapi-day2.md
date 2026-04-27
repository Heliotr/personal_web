---
title: "第一次连上真实数据库：我与PostgreSQL的故事"
slug: "fastapi-postgresql-first"
description: "SQLAlchemy 2.0异步操作实战，踩坑总结"
date: "2025-08-24"
tags:
  - "FastAPI"
  - "PostgreSQL"
  - "SQLAlchemy"
  - "数据库"
category: "技术分享"
readingTime: 11
---

## 01 写在前面


本文记录我第一次用SQLAlchemy 2.0异步操作PostgreSQL的过程，以及踩过的那些坑。

## 02 先启动数据库

用Docker最简单：

```bash
docker run -d --name blog-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=blog_db \
  -p 5432:5432 postgres:16
```

验证一下：
```bash
docker exec -it blog-postgres psql -U postgres -c "SELECT 1"
```

## 03 SQLAlchemy 2.0 异步连接

之前用过Django的ORM，这次用SQLAlchemy 2.0的async，体验很不一样：

```python
# app/db/session.py
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings

# 创建异步引擎
engine = create_async_engine(settings.database_url, echo=settings.debug)

# 创建会话工厂
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 依赖注入获取会话
async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
```

**注意**：`echo=True`会打印SQL语句，调试时很有用，生产环境记得关掉。

## 04 模型定义

SQLAlchemy 2.0的新写法，`Mapped`类型真的香：

```python
# app/models/post.py
from sqlalchemy import String, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin
import enum

class PostStatus(str, enum.Enum):
    draft = "draft"
    published = "published"

class Post(Base, TimestampMixin):
    __tablename__ = "posts"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), index=True)
    content: Mapped[str] = mapped_column(Text)
    status: Mapped[PostStatus] = mapped_column(SAEnum(PostStatus), default=PostStatus.draft, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    
    author: Mapped["User"] = relationship(back_populates="posts")
    comments: Mapped[list["Comment"]] = relationship(back_populates="post", cascade="all, delete-orphan")
```

**对比旧写法**：
```python
# 旧写法（1.x）
id = Column(Integer, primary_key=True)
title = Column(String(200))

# 新写法（2.0）
id: Mapped[int] = mapped_column(primary_key=True)
title: Mapped[str] = mapped_column(String(200))
```

新写法类型提示更完整，IDE支持更好！

## 05 Service层

业务逻辑单独封装，便于复用和测试：

```python
# app/services/post_service.py
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.post import Post, PostStatus
from app.schemas.post import PostCreate

async def create_post(db: AsyncSession, author_id: int, data: PostCreate) -> Post:
    post = Post(**data.model_dump(), author_id=author_id)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post

async def get_posts(db: AsyncSession, skip: int = 0, limit: int = 20):
    query = select(Post).offset(skip).limit(limit).order_by(Post.created_at.desc())
    count_query = select(func.count()).select_from(Post)
    
    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query)
    return list(result.scalars().all()), total
```

## 06 路由接入

最后把Service层接进路由：

```python
# app/api/v1/posts.py
from fastapi import Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services import post_service
from app.schemas.post import PostCreate, PostOut

@router.post("/", response_model=PostOut, status_code=201)
async def create_post(
    data: PostCreate,
    db: AsyncSession = Depends(get_db)
):
    return await post_service.create_post(db, author_id=1, data=data)
```

## 07 我踩过的坑

### 坑1：关系查询N+1问题
```python
# 错误：每个评论都会单独查询用户
post = await db.get(Post, post_id)
for comment in post.comments:
    print(comment.author.username)  # N+1！

# 正确：使用selectinload预加载
result = await db.execute(
    select(Post).options(selectinload(Post.comments).selectinload(Comment.author))
    .where(Post.id == post_id)
)
```

### 坑2：忘记commit
```python
# 错误：数据没有提交到数据库
post = Post(title="Hello")
db.add(post)
# 忘记 await db.commit()

# 正确
db.add(post)
await db.commit()
await db.refresh(post)
```

### 坑3：异步会话不要手动close
```python
# 错误
session = async_session()
try:
    # do something
finally:
    await session.close()  # 不需要！

# 正确：依赖注入会自动管理
async def get_db():
    async with async_session() as session:
        yield session  # 自动close
```

## 08 总结

1. **SQLAlchemy 2.0** 的`Mapped`类型让代码更清晰
2. **async/await** 操作数据库，代码还是同步的风格
3. **selectinload** 解决N+1查询问题
4. **依赖注入** 自动管理数据库连接，省心！

