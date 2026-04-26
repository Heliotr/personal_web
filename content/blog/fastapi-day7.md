---
title: "测试覆盖从0%到80%：我的pytest踩坑之路"
slug: "fastapi-pytest-testing"
description: "从不会写测试到覆盖80%，我是怎么被测试救赎的"
date: "2025-09-28"
tags:
  - "FastAPI"
  - "pytest"
  - "测试驱动开发"
category: "技术分享"
readingTime: 9
---

## 01 血的教训

上线第三周，凌晨3点被电话叫醒：
"服务崩了，500错误！"

一查，原来是我改了`get_post`函数的返回值结构，前端没接住。但凡有点测试，也不至于等到用户投诉...

痛定思痛，开始学测试。

## 02 测试环境搭建

安装依赖：
```bash
pip install pytest pytest-asyncio httpx pytest-cov
```

配置：
```ini
# pytest.ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

## 03 第一个测试

用httpx的AsyncClient测试FastAPI：

```python
# tests/conftest.py
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.main import app
from app.models.base import Base
from app.db.session import get_db

TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/blog_test_db"

test_engine = create_async_engine(TEST_DB_URL, echo=False)
TestSession = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(autouse=True)
async def setup_db():
    # 每个测试前建表
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # 每个测试后删表
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()
```

## 04 测试用例

```python
# tests/test_auth.py
async def test_register(client):
    resp = await client.post("/api/v1/auth/register", json={
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123"
    })
    assert resp.status_code == 201
    assert resp.json()["username"] == "alice"

async def test_login(client):
    # 先注册
    await client.post("/api/v1/auth/register", json={
        "username": "alice", "email": "a@a.com", "password": "pass123"
    })
    
    # 再登录
    resp = await client.post("/api/v1/auth/login", data={
        "username": "alice",
        "password": "pass123"
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()
```

```python
# tests/test_posts.py
async def test_create_post(client):
    resp = await client.post("/api/v1/posts/", json={
        "title": "Hello",
        "content": "World"
    })
    assert resp.status_code == 201
    assert resp.json()["title"] == "Hello"

async def test_cannot_edit_others_post(auth_client, client):
    # 用户A创建文章
    resp = await auth_client.post("/api/v1/posts/", json={
        "title": "My Post",
        "content": "content"
    })
    post_id = resp.json()["id"]
    
    # 用户B尝试编辑
    resp = await client.put(f"/api/v1/posts/{post_id}", json={"title": "Hack"})
    assert resp.status_code == 403
```

## 05 Mock Celery任务

测试异步任务不真正执行：

```python
from unittest.mock import patch

async def test_comment_triggers_notification(auth_client):
    post_resp = await auth_client.post("/api/v1/posts/", json={
        "title": "Blog", "content": "content"
    })
    post_id = post_resp.json()["id"]
    
    with patch("app.services.comment_service.send_new_comment_notification") as mock:
        mock.delay.return_value = None
        resp = await auth_client.post(f"/api/v1/posts/{post_id}/comments/", json={
            "content": "Nice!"
        })
        mock.delay.assert_called_once()  # 验证任务被触发
```

## 06 运行测试

```bash
# 运行所有测试
pytest -v

# 查看覆盖率
pytest --cov=app --cov-report=term-missing
```

覆盖率80%+，安全感拉满！

## 07 总结

1. **测试是保命符**，上线前跑一遍，心里有底
2. **pytest-asyncio**测试异步代码超方便
3. **fixture**复用测试数据，代码简洁
4. **Mock**避免外部依赖，测试更快更稳定

```python
# 测试金字塔
# 单元测试 70% - 每个函数单独测试
# 集成测试 20% - 测试模块间协作
# E2E测试 10% - 关键流程端到端
```

## 7天FastAPI总结

从0到1完成了博客API项目：
- Day1: 项目骨架 + Pydantic
- Day2: PostgreSQL + SQLAlchemy
- Day3: Alembic迁移
- Day4: JWT认证
- Day5: Redis缓存 + Celery
- Day6: Docker部署
- Day7: pytest测试

这7天学的都是工作中真真切切用得上的技能，值！

## 下期预告

接下来要学LangChain了！AI应用开发，7天速通~