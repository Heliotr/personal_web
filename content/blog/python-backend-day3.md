---
title: "FastAPI vs Flask：我全都要！"
slug: "fastapi-flask-choice"
description: "一个后端项目同时用FastAPI做API、Flask做管理后台，真实踩坑分享"
date: "2025-05-10"
tags:
  - "FastAPI"
  - "Flask"
  - "Web框架"
category: "技术分享"
readingTime: 10
---

## 01 艰难的选型

公司要做个短链服务，需要：
- API接口：给前端和第三方调用
- 管理后台：运营人员管理短链

我一开始就在FastAPI和Flask之间纠结。问了GPT，翻了文档，总结如下：

| 特性 | FastAPI | Flask |
|------|---------|-------|
| 性能 | 高（ASGI异步） | 中（WSGI同步） |
| 生态 | 较新但增长快 | 非常成熟 |
| 数据验证 | Pydantic内置 | 需额外库 |
| API文档 | 自动Swagger | 需手动 |
| 上手难度 | 中等 | 低 |

**我的选择：两个都要！**

- FastAPI：高性能API服务
- Flask：快速开发管理后台

## 02 FastAPI真香

先说FastAPI，用它写API真的太爽了：

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="短链API")

class UrlCreate(BaseModel):
    original_url: str = Field(..., min_length=1, max_length=2000)
    custom_code: str | None = Field(None, min_length=4, max_length=10)

@app.post("/api/shorten", response_model=dict)
async def create_short_url(data: UrlCreate):
    if data.custom_code in url_db:
        raise HTTPException(status_code=409, detail="短链码已存在")
    # 业务逻辑
    return {"code": "abc123", "short_url": "http://t.cn/abc123"}
```

**优点**：
- Pydantic自动验证参数，代码量少一半
- 自动生成Swagger文档，接入方狂喜
- 原生异步支持，性能杠杠的
- 依赖注入机制太优雅了

```python
from fastapi import Depends, Header

async def verify_token(x_token: str = Header(...)):
    if x_token != "secret":
        raise HTTPException(401, "Invalid token")
    return x_token

@app.get("/protected")
async def protected_route(token: str = Depends(verify_token)):
    return {"token": token}
```

## 03 Flask也很香

管理后台用Flask，原因是快——模板渲染太方便了：

```python
from flask import Flask, render_template, Blueprint

app = Flask(__name__, template_folder="../templates")

@app.route("/admin/urls")
def url_list():
    urls = [
        {"code": "abc123", "original_url": "https://example.com", "visits": 42},
    ]
    return render_template("url_list.html", urls=urls)
```

```html
<!-- templates/url_list.html -->
<table>
{% for url in urls %}
    <tr>
        <td>{{ url.code }}</td>
        <td>{{ url.original_url[:50] }}...</td>
        <td>{{ url.visits }}</td>
    </tr>
{% endfor %}
</table>
```

**Flask的 Blueprint 很好用**，路由拆分成独立文件：

```python
# app/routes/urls.py
urls_bp = Blueprint("urls", __name__, url_prefix="/admin/urls")

@urls_bp.route("/")
def url_list():
    return render_template("url_list.html", urls=[])

# 注册
app.register_blueprint(urls_bp)
```

## 04 双服务启动

一个端口8000（FastAPI），一个端口5000（Flask），同时运行：

```python
import threading
import uvicorn

def run_fastapi():
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

def run_flask():
    from app.admin import app
    app.run(host="0.0.0.0", port=5000, use_reloader=False)

if __name__ == "__main__":
    t1 = threading.Thread(target=run_fastapi, daemon=True)
    t2 = threading.Thread(target=run_flask, daemon=True)
    t1.start()
    t2.start()
    print("API: http://localhost:8000/docs")
    print("后台: http://localhost:5000/admin/urls/")
    t1.join()
```

## 05 总结

- **API服务选FastAPI**：高性能、自动文档、类型安全
- **管理后台选Flask**：模板渲染方便、快速开发
- **小项目两个都用**，各取所长不香吗？

