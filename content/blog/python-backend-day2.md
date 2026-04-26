---
title: "异步编程真香定律：一个请求耗时从10秒降到1秒的优化实战"
slug: "python-async-learning"
description: "从多线程到asyncio，我的性能优化踩坑之路"
date: "2025-05-03"
tags:
  - "Python"
  - "asyncio"
  - "性能优化"
category: "技术分享"
readingTime: 11
---

## 接上回

上回说到我被多线程的GIL坑了一把，这次来聊聊我是怎么被asyncio拯救的。

## 01 血淋淋的性能对比

之前用ThreadPoolExecutor写了下载器，10个URL每个延迟1秒，3个线程并发，耗时大概4秒。代码大概是这样的：

```python
from concurrent.futures import ThreadPoolExecutor
import requests
import time

URLS = [f"https://httpbin.org/delay/1?id={i}" for i in range(10)]

def download(url):
    resp = requests.get(url, timeout=10)
    return url, resp.status_code

start = time.time()
with ThreadPoolExecutor(max_workers=3) as pool:
    results = pool.map(download, URLS)
print(f"耗时: {time.time() - start:.2f}s")  # ~4秒
```

然后我重构成了asyncio版本：

```python
import asyncio
import aiohttp

async def download(session, url):
    async with session.get(url) as resp:
        return url, resp.status_code

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [download(session, url) for url in URLS]
        await asyncio.gather(*tasks)

start = time.time()
asyncio.run(main())
print(f"耗时: {time.time() - start:.2f}s")  # ~1秒
```

**同样是3个并发，asyncio只用了1秒！** 关键就在于协程切换几乎零开销，而线程切换需要操作系统介入。

## 02 协程代码怎么写

asyncio的核心就是`async`和`await`：

```python
import asyncio

# 定义协程函数
async def fetch_data(url):
    print(f"开始请求: {url}")
    await asyncio.sleep(1)  # 模拟异步I/O
    return f"数据: {url}"

async def main():
    # 并发执行
    results = await asyncio.gather(
        fetch_data("url1"),
        fetch_data("url2"),
        fetch_data("url3"),
    )
    for r in results:
        print(r)

asyncio.run(main())
```

**我的踩坑经验**：
1. `async def`定义的函数返回的是协程对象，不会立即执行
2. 必须用`asyncio.run()`或`await`来触发执行
3. `await`后面必须是协程对象��不���是普通函数

## 03 并发数控制

协程虽好，但也不能无限制地并发。之前我就犯过这个错误：

```python
async def main():
    # 1000个请求同时发起
    tasks = [download(session, url) for url in URLS]
    await asyncio.gather(*tasks)  # 服务器炸了
```

后来学乖了，用`Semaphore`限流：

```python
async def download_with_limit(session, url, semaphore):
    async with semaphore:  # 最多10个并发
        async with session.get(url) as resp:
            return url, resp.status

async def main():
    semaphore = asyncio.Semaphore(10)  # 关键！
    async with aiohttp.ClientSession() as session:
        tasks = [download_with_limit(session, url, semaphore) for url in URLS]
        await asyncio.gather(*tasks)
```

## 04 装饰器yyds

在项目中，装饰器真的太好用了。分享几个我常用的：

```python
import functools
import time
import logging

# 1. 计时装饰器
def timer(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = await func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        logging.info(f"{func.__name__} 耗时 {elapsed:.2f}s")
        return result
    return wrapper

# 2. 重试装饰器
def retry(max_attempts=3, delay=1.0):
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt < max_attempts - 1:
                        await asyncio.sleep(delay)
                    else:
                        raise
        return wrapper
    return decorator

# 使用
@timer
@retry(max_attempts=3)
async def call_api(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            return await resp.json()
```

## 05 上下文管理器也要异步

连接资源时，异步上下文管理器是必须的：

```python
class AsyncDBConnection:
    async def __aenter__(self):
        self.conn = await connect_db()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()

# 使用
async with AsyncDBConnection() as conn:
    await conn.query("SELECT * FROM users")
```

`contextlib`也支持异步版本：

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def timer(name):
    start = time.perf_counter()
    yield
    print(f"{name} 耗时 {time.perf_counter() - start:.2f}s")

async with timer("数据库查询"):
    await db.query("SELECT * FROM users")
```

## 06 总结

1. **asyncio适合高并发I/O场景**，性能远超多线程
2. **一定要用Semaphore控制并发数**，别把人家服务器搞崩了
3. **async/await是语法糖**，背后是事件循环在调度
4. **装饰器+异步**是最佳拍档，代码简洁又强大

## 下期预告

接下来要学Web框架了，FastAPI和Flask怎么选？它们有什么区别？我会在下篇博文中详细分享~