---
title: "我在多线程爬坑中学到的那些事"
slug: "python-concurrency-learning"
description: "从0开始学习Python并发编程，分享我在实际项目中踩过的坑和解决方案"
date: "2025-04-26"
tags:
  - "Python"
  - "并发编程"
  - "实战经验"
category: "技术分享"
readingTime: 12
---

## 前言

大家好！最近在工作之余系统学习Python后端开发，之前一直CURD CRUD，确实该好好补一下基础了。

这篇文章记录我在学习Python并发编程过程中的心得体会，特别是那些让我栽过跟头的地方，希望能给同样在学习这块内容的同学一些参考。

## 01 被忽视的GIL

刚开始学多线程的时候，我信心满满地写了这段代码：

```python
import threading
import time

def cpu_task(n):
    total = 0
    for i in range(n):
        total += i
    return total

# 开两个线程并行计算
t1 = threading.Thread(target=cpu_task, args=(10**7,))
t2 = threading.Thread(target=cpu_task, args=(10**7,))
t1.start()
t2.start()
t1.join()
t2.join()
```

理论上应该快一��对吧？实际上几乎没变化。这就是Python的GIL在作祟——同一时刻只有一个线程能执行Python字节码。

**我的理解**：GIL就像公司里只有一台打印机，所有人要用都得排队。对于I/O密集型任务（比如等待网络请求），线程可以暂时"放弃"打印机，所以多线程有用；但CPU密集型任务（比如计算），大家都要用打印机，反而互相拖累。

## 02 线程池真的香

手动管理线程太累了，后来我学会了用`concurrent.futures`：

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

URLS = [f"https://httpbin.org/delay/1?id={i}" for i in range(10)]

def download(url):
    resp = requests.get(url, timeout=10)
    return url, resp.status_code

# 3个线程并发执行
with ThreadPoolExecutor(max_workers=3) as pool:
    futures = {pool.submit(download, url): url for url in URLS}
    
    for future in as_completed(futures):
        url, status = future.result()
        print(f"[{status}] {url}")
```

**血的教训**：线程池大小不是越大越好！之前我开50个线程去请求一个接口，结果被人家封IP了...后来学乖了，用`Semaphore`控制并发：

```python
import asyncio
import aiohttp

async def download(session, url, semaphore):
    async with semaphore:  # 最多3个并发
        async with session.get(url) as resp:
            return url, resp.status

semaphore = asyncio.Semaphore(3)  # 关键！
```

## 03 锁没加对地方会死锁

这是最让我崩溃的问题。场景是这样的：

```python
import threading

balance = 1000
lock = threading.Lock()

def withdraw(amount):
    global balance
    if balance >= amount:
        time.sleep(0.1)  # 模拟处理
        balance -= amount
        print(f"取款成功，余额: {balance}")
    else:
        print("余额不足")

# 两个线程同时取1000
t1 = threading.Thread(target=withdraw, args=(1000,))
t2 = threading.Thread(target=withdraw, args=(1000,))
t1.start()
t2.start()
```

结果是余额变成负数了！后来才知道要把判断和扣款放在同一个锁里：

```python
def withdraw(amount):
    global balance
    with lock:  # 整个操作都要加锁
        if balance >= amount:
            time.sleep(0.1)
            balance -= amount
```

## 04 装饰器差点没把我送走

装饰器学了好几天才搞明白，特别是带参数的那种：

```python
import functools
import time

def retry(max_attempts=3, delay=1.0):
    """三层嵌套，理解了之后就很简单"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
                    else:
                        raise
        return wrapper
    return decorator

@retry(max_attempts=5, delay=0.5)
def call_api():
    # 业务代码
    pass
```

**提醒**：一定要加`@functools.wraps(func)`！否则函数名和文档字符串都会丢，调试的时候能把你逼疯。

## 05 异步才是真香

后来公司接了一个需要高并发的项目，asyncio了解一下：

```python
import asyncio
import aiohttp

async def download(session, url):
    async with session.get(url) as resp:
        return url, resp.status

async def main():
    urls = [f"https://httpbin.org/delay/1?id={i}" for i in range(10)]
    
    async with aiohttp.ClientSession() as session:
        tasks = [download(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        
        for url, status in results:
            print(f"[{status}] {url}")

asyncio.run(main())
```

10个请求，每个延迟1秒，但总耗时只有1秒多一点！这不比多线程香吗？

## 06 总结

1. **I/O密集型任务**：用多线程或asyncio
2. **CPU密集型任务**：用多进程
3. **线程池大小**：I/O密集型=CPU核数×2~5，CPU密集型=CPU核数
4. **共享资源一定要加锁**，而且要把整个操作锁住
5. **装饰器要加`functools.wraps`**
6. **高并发场景优先考虑asyncio**

这些都是我实际踩坑后的总结，希望对大家有帮助。如果有问题，欢迎在评论区交流！

