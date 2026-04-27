---
title: "被黑客攻击后我学会了JWT"
slug: "fastapi-jwt-auth-story"
description: "从0实现用户注册登录，JWT认证保护API"
date: "2025-09-07"
tags:
  - "FastAPI"
  - "JWT"
  - "认证"
  - "安全"
category: "技术分享"
readingTime: 10
---

## 01 事故现场

上周测试环境被人暴力破解了——因为接口完全没有认证！

虽然只是测试环境，但让我意识到：**不做认证=裸奔**。

这周紧急学习了JWT认证，记录如下。

## 02 JWT是什么

JWT（JSON Web Token）由三部分组成：
- Header：算法类型
- Payload：业务数据（比如用户ID）
- Signature：签名验证

```python
import jwt
from datetime import datetime, timedelta

# 生成Token
payload = {
    "sub": "123",  # 用户ID
    "username": "alice",
    "exp": datetime.utcnow() + timedelta(hours=2)
}
token = jwt.encode(payload, "secret-key", algorithm="HS256")

# 验证Token
try:
    data = jwt.decode(token, "secret-key", algorithms=["HS256"])
    print(f"用户ID: {data['sub']}")
except jwt.ExpiredSignatureError:
    print("Token已过期")
except jwt.InvalidTokenError:
    print("Token无效")
```

## 03 密码要加密

永远不要明文存储密码！

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 加密
hashed = pwd_context.hash("password123")
print(hashed)  # $2b$12$...

# 验证
pwd_context.verify("password123", hashed)  # True
pwd_context.verify("wrong", hashed)  # False
```

## 04 完整的注册登录

```python
# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services import user_service
from app.core.security import create_access_token
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register(username: str, email: str, password: str, db: AsyncSession = Depends(get_db)):
    # 检查用户是否存在
    existing = await user_service.get_user_by_username(db, username)
    if existing:
        raise HTTPException(400, "用户名已存在")
    
    # 创建用户（密码加密存储）
    user = await user_service.create_user(db, username, email, password)
    return {"id": user.id, "username": user.username}

@router.post("/login")
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # 验证用户
    user = await user_service.get_user_by_username(db, form.username)
    if not user or not pwd_context.verify(form.password, user.hashed_password):
        raise HTTPException(401, "用户名或密码错误")
    
    # 生成Token
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}
```

## 05 保护接口

用`Depends`实现登录认证：

```python
# app/core/deps.py
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.security import decode_access_token
from app.services import user_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    # 验证Token
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(401, "无效的Token")
    
    # 获取用户
    user_id = int(payload.get("sub"))
    user = await user_service.get_user(db, user_id)
    if user is None:
        raise HTTPException(401, "用户不存在")
    
    return user
```

使用：
```python
from app.core.deps import get_current_user
from app.models.user import User

@router.put("/posts/{post_id}")
async def update_post(
    post_id: int,
    data: PostUpdate,
    current_user: User = Depends(get_current_user),  # 需要登录
    db: AsyncSession = Depends(get_db)
):
    # 只有作者能编辑自己的文章
    post = await post_service.get_post(db, post_id)
    if post.author_id != current_user.id:
        raise HTTPException(403, "只能编辑自己的文章")
    return await post_service.update_post(db, post, data)
```

## 06 我踩过的坑

### 坑1：Token过期时间
```python
# 错误：Token永不过期
payload = {"sub": "123"}  # 没有exp

# 正确：设置过期时间
payload = {"sub": "123", "exp": datetime.utcnow() + timedelta(hours=2)}
```

### 坑2：密码明文传输
```python
# 错误：JSON body传密码
{"username": "alice", "password": "123456"}

# 正确：用OAuth2PasswordRequestForm（form表单）
username=alice&password=123456
```

### 坑3：没有验证Token合法性
```python
# 错误：直接信任Token
user_id = token  # 危险！

# 正确：解码验证
payload = decode_access_token(token)  # 会验证签名和过期
user_id = payload.get("sub")
```

## 07 总结

1. **JWT无状态**，服务端不需要存储Token
2. **密码必须加密**，用bcrypt
3. **Token要设置过期时间**
4. **接口保护用Depends**，简单又优雅

```python
# 完整流程
# 1. 注册 /auth/register
# 2. 登录 /auth/login -> 获取Token
# 3. 请求头 Authorization: Bearer <token>
# 4. Depends(get_current_user) 验证Token
```

