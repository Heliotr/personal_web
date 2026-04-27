---
title: "AI是怎么记住对话的？深入理解短期记忆机制"
slug: "langchain-short-term-memory"
description: "Checkpointer、thread_id、state vs context，一文搞懂"
date: "2026-02-14"
tags:
  - "LangChain"
  - "短期记忆"
  - "Checkpointer"
category: "技术分享"
readingTime: 8
---

## 01 痛点

之前的Agent每次对话都是独立的：

```python
# 第一轮
result1 = agent.invoke({"messages": [{"role": "user", "content": "我叫张三"}]})

# 第二轮
result2 = agent.invoke({"messages": [{"role": "user", "content": "我叫什么？"}]})
print(result2["messages"][-1].content)
# 输出：抱歉我不知道你叫什么
```

这怎么行？得让AI记住对话上下文！

## 02 Checkpointer机制

```python
from langgraph.checkpoint.memory import InMemorySaver

# 创建内存检查点存储器
checkpointer = InMemorySaver()

# 创建带记忆的Agent
agent = create_agent(
    model=llm,
    tools=[],
    checkpointer=checkpointer
)

config = {"configurable": {"thread_id": "session_001"}}

# 第一轮对话
result1 = agent.invoke(
    {"messages": [{"role": "user", "content": "我叫张三"}]},
    config
)

# 第二轮对话 - 记住之前说的了！
result2 = agent.invoke(
    {"messages": [{"role": "user", "content": "我叫什么？"}]},
    config
)
print(result2["messages"][-1].content)
# 输出：我叫张三
```

**核心**：`thread_id`会话隔离，不同用户的对话互不影响。

## 03 自定义状态

除了消息还能记住其他信息：

```python
from langchain.agents import AgentState

class CustomerState(AgentState):
    user_name: str = ""
    current_order_id: str = ""
    preference: list[str] = field(default_factory=list)

agent = create_agent(
    model=llm,
    tools=[],
    checkpointer=InMemorySaver(),
    state_schema=CustomerState
)

# 记录用户信息
agent.invoke({
    "messages": [{"role": "user", "content": "你好"}],
    "user_name": "张三",
    "preference": ["苹果", "香蕉"]
}, config)
```

## 04 通过工具修改状态

工具执行后可以更新状态：

```python
from langgraph.types import Command
from langchain.tools import tool, ToolRuntime

@tool
def update_profile(name: str, hobby: str, runtime: ToolRuntime) -> Command:
    """更新用户资料"""
    return Command(update={
        "user_name": name,
        "preference": [hobby],
        "messages": [
            ToolMessage(
                content=f"已更新：姓名={name}, 爱好={hobby}",
                tool_call_id=runtime.tool_call_id
            )
        ]
    })
```

## 05 state vs context

| 特性 | state | context |
|------|-------|---------|
| 持久化 | ✅ Checkpointer | ❌ 每次传 |
| 跨会话 | ✅ thread_id恢复 | ❌ 不行 |
| 用法 | 直接放在invoke参数 | 通过context参数 |

```python
agent.invoke(
    {
        "messages": [...],
        "user_name": "张三"  # 会持久化
    },
    config=config,
    context={"channel": "APP"}  # 临时，不持久化
)
```

## 06 总结

1. **Checkpointer** 让Agent记住对话
2. **thread_id** 隔离不同会话
3. **state** 持久化数据可恢复
4. **context** 临时参数不持久化
5. **Command** 工具可更新状态

这就是AI能"记住"你的名字、偏好的原理！

