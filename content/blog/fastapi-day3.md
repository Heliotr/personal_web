---
title: "数据库迁移翻车现场：Alembic救了我"
slug: "fastapi-alembic-story"
description: "第一次用Alembic踩坑实录，生产环境数据库迁移要注意啥"
date: "2025-08-31"
tags:
  - "FastAPI"
  - "Alembic"
  - "数据库迁移"
category: "技术分享"
readingTime: 9
---

## 01 事故现场

上周我信心满满地给线上数据库加了字段：

```python
# app/models/post.py
class Post(Base):
    # ... 其他字段
    view_count: Mapped[int] = mapped_column(default=0)  # 新增
```

然后直接重启服务...

**boom！** 服务启动失败，数据库报错：列不存在。

后来才知道，`create_all()`只能创建新表，不能修改已有表结构。我需要Alembic！

## 02 Alembic初体验

安装：
```bash
pip install alembic
alembic init alembic
```

配置`alembic.ini`：
```ini
sqlalchemy.url = postgresql+asyncpg://postgres:postgres@localhost:5432/blog_db
```

配置`alembic/env.py`，添加模型引用：
```python
from app.models.base import Base
from app.models.user import User
from app.models.post import Post
from app.models.comment import Comment
from app.models.category import Category

target_metadata = Base.metadata
```

## 03 生成第一个迁移

```bash
alembic revision --autogenerate -m "create all tables"
```

生成的迁移文件：
```python
# alembic/versions/xxxx_create_all_tables.py
"""create all tables

Revision ID: xxx
Revises:
Create Date: 2026-05-31 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision, down_revision 需要手动填写
revision = 'xxx'
down_revision = None

def upgrade():
    op.create_table('users', ...)
    op.create_table('posts', ...)

def downgrade():
    op.drop_table('posts')
    op.drop_table('users')
```

执行迁移：
```bash
alembic upgrade head
```

## 04 添加新字段

后来需要给Post加`view_count`：

```python
# app/models/post.py
view_count: Mapped[int] = mapped_column(default=0)
```

生成迁移：
```bash
alembic revision --autogenerate -m "add view_count to post"
```

```python
# alembic/versions/xxxx_add_view_count.py
def upgrade():
    op.add_column('posts', sa.Column('view_count', sa.Integer(), nullable=True))

def downgrade():
    op.drop_column('posts', 'view_count')
```

执行：
```bash
alembic upgrade head
```

完美！

## 05 我踩过的坑

### 坑1：autogenerate检测不到所有变更
```python
# 这种改名autogenerate检测不到
name = Column('name', String(50))  # 改为
name = Column('username', String(50))

# 需要手写迁移
def upgrade():
    op.alter_column('users', 'name', new_column_name='username')
```

### 坑2：生产环境先演练
```bash
# 先检查有哪些迁移
alembic history

# 在测试库演练一遍
alembic upgrade head --database=postgresql://test@localhost/test_db
```

### 坑3：迁移顺序要填对
```python
# 生成的迁移文件默认down_revision是None
revision = 'abc123'
down_revision = None  # 错了！应该填上一个版本的revision

# 要改成上一个版本
down_revision = 'xyz789'
```

## 06 总结

1. **不用create_all()**，用Alembic管理数据库版本
2. **生成迁移后要检查**， autogenerate不是万能的
3. **生产环境先测试**，备份！备份！备份！
4. **down_revision要填对**，保证迁移可回滚

```bash
# 常用命令
alembic revision --autogenerate -m "描述"  # 生成迁移
alembic upgrade head                       # 升级到最新
alembic downgrade -1                       # 回滚一个版本
alembic history                            # 查看迁移历史
alembic current                            # 查看当前版本
```
