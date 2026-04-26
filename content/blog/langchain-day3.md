---
title: "我做出了第一个AI智能体：它会自己思考和工具调用"
slug: "langchain-agent-first"
description: "从纯LLM到Agent，我理解了AI为什么能"思考""
date: "2026-01-24"
tags:
  - "LangChain"
  - "Agent"
  - "ReAct"
  - "智能体"
category: "技术分享"
readingTime: 9
---

## 01 什么是Agent？

学Agent之前我一直有个疑问：AI回答问题不挺好吗？为什么要搞个Agent？

直到我让它查天气、订机票、读文件... 它说"对不起，我做不到"。

**Agent = LLM + 工具 + 自主决策能力**

纯LLM：你问什么，我答什么
LLM+工具：你能调用工具，但我得告诉你用什么
Agent：你自己判断需要什么工具，我来执行

## 02 ReAct框架

ReAct = Reasoning（推理） + Acting（行动）

举个例子：用户问"北京天气怎么样？"

**传统LLM**：
- 直接回答：我不知道实时天气

**ReAct Agent**：
1. 推理：用户问天气，我需要调用天气工具
2. 行动：调用get_weather("北京")
3. 观察：返回"晴，25度"
4. 推理：拿到天气信息了
5. 行动：回答用户"北京今天晴，25度"

## 03 创建我的第一个Agent

```python
from langchain.agents import create_agent
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气
    
    Args:
        city: 城市名称，如"北京"
    """
    weather_map = {
        "北京": "晴，25°C",
        "上海": "多云，28°C",
        "广州": "雨，24°C",
    }
    return weather_map.get(city, "未知")

# 创建Agent
agent = create_agent(
    model=llm,
    tools=[get_weather],
    system_prompt="你是一个天气助手，回答用户关于天气的问题"
)

# 调用
result = agent.invoke({"messages": [{"role": "user", "content": "北京天气怎么样"}]})
print(result["messages"][-1].content)
# 输出：北京今天晴，25°C
```

## 04 流式输出

打字机效果，更酷炫：

```python
for chunk in agent.stream({"messages": [{"role": "user", "content": "上海天气如何"}]}):
    for step, data in chunk.items():
        if step == "model":
            print(data["messages"][-1].content, end="")
```

## 05 context_schema

传递上下文信息：

```python
from typing import TypedDict

class UserContext(TypedDict):
    user_id: str
    vip_level: str  # 普通/黄金/钻石

agent = create_agent(
    model=llm,
    tools=[get_weather],
    context_schema=UserContext
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "天气如何"}]},
    context={"user_id": "user_001", "vip_level": "gold"}
)
```

## 06 我的理解

**Agent的本质是循环**：
1. 接收用户输入
2. LLM决定要做什么（推理）
3. 执行工具（行动）
4. 获取工具结果（观察）
5. 把结果给LLM，继续推理
6. 直到任务完成，返回结果

这就是为什么AI看起来像在"思考"——它确实在不断推理和行动！

## 07 总结

1. **Agent = LLM + 工具 + 决策循环**
2. **ReAct**让AI能自主使用工具
3. **create_agent**一行代码创建Agent
4. **context**传递用户信息

## 下期预告

Tool怎么写才规范？Pydantic参数验证、错误处理怎么搞？下篇见~