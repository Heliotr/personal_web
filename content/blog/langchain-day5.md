---
title: "Agent高级玩法：结构化输出、动态提示词、消息截断"
slug: "langchain-agent-advanced"
description: "让AI更智能：自定义输出格式、动态切换提示词、自动管理上下文"
date: "2026-02-07"
tags:
  - "LangChain"
  - "Agent"
  - "中间件"
category: "技术分享"
readingTime: 8
---

## 01 前言

学完基础Agent后，我一直有个想法：能不能让Agent直接返回结构化数据？能不能根据用户类型动态切换提示词？

答案是：能！LangChain的中间件机制太强大了。

## 02 Agent结构化输出

之前学的`with_structured_output`是LLM级别的，Agent也能直接输出结构化数据：

```python
from langchain.agents.structured_output import ToolStrategy
from pydantic import BaseModel, Field

class AnalysisResult(BaseModel):
    sentiment: str = Field(description="情感：positive/negative/neutral")
    keywords: list[str] = Field(description="关键词")
    score: float = Field(description="情感得分0-1")

agent = create_agent(
    model=llm,
    tools=[],
    response_format=ToolStrategy(AnalysisResult)
)

result = agent.invoke({"messages": [{"role": "user", "content": "这个产品太棒了，强烈推荐"}]})
print(result["structured_response"])
# AnalysisResult(sentiment='positive', keywords=['产品', '推荐'], score=0.9)
```

## 03 动态提示词

根据用户类型切换不同的prompt：

```python
from langchain.agents.middleware import dynamic_prompt, ModelRequest

@dynamic_prompt
def custom_prompt(request: ModelRequest) -> str:
    user_type = request.runtime.context.get("user_type", "normal")
    if user_type == "vip":
        return "你是高级客服，回答要专业详细，提供更多建议..."
    return "你是普通客服，回答要简洁明了..."

agent = create_agent(
    model=llm,
    tools=[],
    middleware=[custom_prompt],
    context_schema={"user_type": str}
)
```

**场景**：普通用户 vs VIP用户，客服的回答风格完全不同！

## 04 动态模型选择

简单问题用小模型，复杂问题用大模型，省钱！

```python
from langchain.agents.middleware import wrap_model_call, ModelRequest

@wrap_model_call
def dynamic_model(request: ModelRequest, handler):
    msg_count = len(request.state["messages"])
    # 超过5轮对话，用高级模型
    if msg_count >= 5:
        return handler(request.override(model=advanced_llm))
    return handler(request)

agent = create_agent(
    model=basic_llm,  # 便宜模型
    tools=[],
    middleware=[dynamic_model]
)
```

## 05 消息截断

上下文太长了？截掉！

```python
from langchain.agents.middleware import before_model
from langchain.messages import RemoveMessage

@before_model
def trim_messages(state, runtime):
    messages = state["messages"]
    if len(messages) > 5:
        # 保留最近3条
        return {"messages": [RemoveMessage(id=m.id) for m in messages[:-3]]}
    return None

agent = create_agent(
    model=llm,
    tools=[],
    middleware=[trim_messages]
)
```

**作用**：省token，不超过模型上下文限制。

## 06 总结

1. **Agent结构化输出**：返回Pydantic对象
2. **动态提示词**：根据上下文切换风格
3. **动态模型选择**：省钱又智能
4. **消息截断**：管理上下文长度

这些中间件让Agent变得更加灵活和可控！

## 下期预告

Agent的"记忆"是怎么实现的？短期记忆篇~