---
title: "让AI返回结构化数据：我被Pydantic拯救了"
slug: "langchain-structured-output"
description: "JSON、Pydantic、TypedDict，AI输出格式化的正确姿势"
date: "2026-01-17"
tags:
  - "LangChain"
  - "结构化输出"
  - "Pydantic"
category: "技术分享"
readingTime: 8
---

## 01 痛点

让AI返回JSON有多痛苦？谁试过谁知道。

```python
# 之前的做法：让AI自己拼JSON
response = llm.invoke("给我返回一个JSON，用户名和年龄")
print(response.content)  # 输出可能是：
# {"username": "张三", "age": 18}
# 或者
# 用户名：张三，年龄：18
# 或者
# 抱歉，我不太理解你的要求
```

有了LangChain的结构化输出，稳了！

## 02 Pydantic模式

定义模型，让AI按格式输出：

```python
from pydantic import BaseModel, Field
from langchain.chat_models import init_chat_model

llm = init_chat_model(model="deepseek-chat", model_provider="deepseek", 
                      api_key=os.getenv("DEEPSEEK_API_KEY"), 
                      base_url=os.getenv("DEEPSEEK_BASE_URL"))

class Movie(BaseModel):
    title: str = Field(description="电影标题")
    year: int = Field(description="上映年份")
    rating: float = Field(description="评分")
    genre: list[str] = Field(description="电影类型")

# 创建结构化输出LLM
structured_llm = llm.with_structured_output(Movie)

# 测试
result = structured_llm.invoke("给我介绍电影《星际穿越》")
print(result.title)     # 星际穿越
print(result.year)      # 2014
print(result.rating)    # 8.7
print(result.genre)     # ['科幻', '冒险', '剧情']
print(type(result))     # <class '__main__.Movie'>
```

**爽点**：返回的是Pydantic对象，直接`.title`、`.year`调用！

## 03 实际应用场景

### 场景1：提取用户信息

```python
class UserInfo(BaseModel):
    username: str
    email: str
    age: int | None = None

extract_llm = llm.with_structured_output(UserInfo)
result = extract_llm.invoke("用户张三，邮箱zhangsan@qq.com，25岁")
# result: UserInfo(username='张三', email='zhangsan@qq.com', age=25)
```

### 场景2：情感分析

```python
class SentimentResult(BaseModel):
    sentiment: str = Field(description="情感：positive/negative/neutral")
    score: float = Field(description="情感得分0-1")
    keywords: list[str] = Field(description="关键词")

analyze_llm = llm.with_structured_output(SentimentResult)
result = analyze_llm.invoke("这个产品太棒了，强烈推荐！")
# result: SentimentResult(sentiment='positive', score=0.95, keywords=['产品', '推荐'])
```

## 04 速率限制

防止API被限流：

```python
from langchain_core.rate_limiters import InMemoryRateLimiter

rate_limiter = InMemoryRateLimiter(
    requests_per_second=0.1,  # 每10秒1个请求
    check_every_n_seconds=0.1,
    max_bucket_size=5,
)

llm_with_limit = init_chat_model(
    model="deepseek-chat",
    model_provider="deepseek",
    rate_limiter=rate_limiter,
)
```

## 05 Invocation Config

运行时动态配置：

```python
response = llm.invoke(
    "你好",
    config={
        "run_name": "greeting",      # 追踪名称
        "tags": ["test", "greeting"],# 标签分类
        "metadata": {"user_id": "123"},  # 业务元数据
        "configurable": {
            "temperature": 0.7,      # 动态修改温度
            "max_tokens": 100        # 动态修改最大token
        }
    }
)
```

## 06 总结

1. **Pydantic模式**：返回结构化对象，类型安全
2. **Field描述**：让AI更好地理解字段含义
3. **速率限制**：保护API不被限流
4. **Invocation Config**：运行时动态配置

```python
# 结构化输出的正确姿势
class OutputSchema(BaseModel):
    field1: str = Field(description="字段1含义")
    field2: int = Field(description="字段2含义")

llm.with_structured_output(OutputSchema)
```

