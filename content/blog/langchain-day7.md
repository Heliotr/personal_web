---
title: "AI永远记得你：长期记忆与电商客服助手实战"
slug: "langchain-long-term-memory"
description: "Store机制、跨会话记忆、消息摘要，一个完整的电商客服项目"
date: "2026-02-21"
tags:
  - "LangChain"
  - "长期记忆"
  - "Store"
  - "实战项目"
category: "技术分享"
readingTime: 10
---

## 01 长期记忆 vs 短期记忆

短期记忆：会话期间有效，关闭页面就忘了
长期记忆：永久保存，跨会话也能记住你

**举例**：
- 短期记忆：记住当前对话中用户说过的话
- 长期记忆：记住用户上次说喜欢的商品类型

## 02 Store机制

```python
from langgraph.store.memory import InMemoryStore

store = InMemoryStore()

# 写入长期记忆 (namespace, key, value)
store.put(("user_123", "preferences"), "fruit", {"likes": ["苹果", "香蕉"]})

# 读取
mem = store.get(("user_123", "preferences"), "fruit")
print(mem.value)  # {'likes': ['苹果', '香蕉']}

# 搜索
all_mem = store.search(("user_123", "preferences"))
```

**与Checkpointer的区别**：
- Checkpointer：存储对话消息，按thread_id隔离
- Store：存储业务数据，按namespace隔离

## 03 工具中读写长期记忆

```python
from langchain.tools import tool, ToolRuntime

@tool
def get_user_preference(runtime: ToolRuntime) -> str:
    """获取用户偏好"""
    user_id = runtime.context.user_id
    pref = runtime.store.get(("users",), user_id)
    if pref:
        return f"用户偏好：{pref.value}"
    return "暂无偏好记录"

@tool
def save_preference(item: str, runtime: ToolRuntime) -> str:
    """保存用户偏好"""
    user_id = runtime.context.user_id
    runtime.store.put(("users",), user_id, {"item": item})
    return f"已保存：{item}"
```

## 04 消息摘要

对话太长了怎么办？自动摘要：

```python
from langchain.agents.middleware import SummarizationMiddleware

agent = create_agent(
    model=llm,
    tools=[],
    middleware=[
        SummarizationMiddleware(
            model=llm,
            trigger=("messages", 10),  # 消息数≥10触发
            keep=("messages", 5),      # 保留最近5条
            summary_prompt="总结以下对话要点：{messages}"
        )
    ],
    checkpointer=InMemorySaver()
)
```

## 05 完整项目：电商客服助手

整合所有知识点：

```python
# ========== 电商客服助手 ==========

from langchain.agents import create_agent, AgentState
from langchain.agents.middleware import SummarizationMiddleware, wrap_tool_call
from langchain.tools import tool, ToolRuntime
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command
from pydantic import BaseModel

# Context
class UserContext(BaseModel):
    user_id: str
    channel: str  # APP/Web

# State
class CustomerState(AgentState):
    current_order_id: str = ""

# 模拟数据
MOCK_ORDERS = {"order001": {"status": "已发货", "product": "iPhone15"}}

# 工具
@tool
def query_order(order_id: str, runtime: ToolRuntime) -> Command:
    """查询订单状态"""
    order = MOCK_ORDERS.get(order_id)
    if not order:
        return Command(update={"messages": [
            ToolMessage(content=f"订单{order_id}不存在", tool_call_id=runtime.tool_call_id)
        ]})
    
    return Command(update={
        "current_order_id": order_id,
        "messages": [ToolMessage(
            content=f"订单{order_id}状态：{order['status']}，商品：{order['product']}",
            tool_call_id=runtime.tool_call_id
        )]
    })

@tool
def save_preference(category: str, item: str, runtime: ToolRuntime) -> str:
    """保存用户偏好"""
    user_id = runtime.context.user_id
    runtime.store.put((f"user_{user_id}", "preferences"), category, {"item": item})
    return f"已记录偏好：喜欢{category}类的{item}"

@tool
def get_recommendation(runtime: ToolRuntime) -> str:
    """基于偏好推荐"""
    user_id = runtime.context.user_id
    prefs = runtime.store.search((f"user_{user_id}", "preferences"))
    if prefs:
        return f"基于您的偏好，为您推荐：xxx"
    return "暂无偏好记录，为您推荐热门商品"

# 错误处理
@wrap_tool_call
def handle_errors(request, handler):
    try:
        return handler(request)
    except Exception as e:
        return ToolMessage(
            content=f"服务繁忙，请稍后重试：{str(e)}",
            tool_call_id=request.tool_call["id"]
        )

# 创建Agent
agent = create_agent(
    model=llm,
    tools=[query_order, save_preference, get_recommendation],
    system_prompt="你是电商客服，帮助用户查询订单、推荐商品。",
    checkpointer=InMemorySaver(),
    store=InMemoryStore(),
    state_schema=CustomerState,
    context_schema=UserContext,
    middleware=[
        SummarizationMiddleware(model=llm, trigger=("messages", 10), keep=("messages", 5)),
        handle_errors
    ]
)

# 测试
config = {"configurable": {"thread_id": "s1"}}
context = UserContext(user_id="user_123", channel="APP")

# 对话1：查询订单
agent.invoke({"messages": [{"role": "user", "content": "查订单order001"}]}, config, context)

# 对话2：保存偏好
agent.invoke({"messages": [{"role": "user", "content": "我喜欢苹果手机"}]}, config, context)

# 对话3：跨会话获取推荐（新session）
config2 = {"configurable": {"thread_id": "s2"}}
agent.invoke({"messages": [{"role": "user", "content": "给我推荐"}]}, config2, context)
```

## 06 17天学习总结

从Python基础到FastAPI后端，再到LangChain AI应用，17天学下来：

**学习计划3（Python基础）**：
- Day1: 并发编程（多线程/多进程/协程）
- Day2: 异步编程、装饰器、上下文管理器
- Day3: FastAPI + Flask Web框架

**学习计划1（FastAPI后端）**：
- Day1: 项目骨架、Pydantic
- Day2: PostgreSQL + SQLAlchemy
- Day3: Alembic迁移
- Day4: JWT认证
- Day5: Redis缓存 + Celery
- Day6: Docker部署
- Day7: pytest测试

**学习计划2（LangChain AI）**：
- Day1: LangChain基础、模型初始化
- Day2: 结构化输出、速率限制
- Day3: Agent智能体
- Day4: Tools工具开发
- Day5: Agent高级特性
- Day6: 短期记忆
- Day7: 长期记忆 + 综合项目

## 07 写在最后

这17天学的都是当下最实用的技术：
- Python后端开发能力
- 异步高性能API设计
- 数据库设计与管理
- AI应用开发技能

这些都是能直接用在工作和项目中的技能。

感谢看到这里的你！技术之路漫长，我们一起加油！

**代码改变世界，从你开始。**