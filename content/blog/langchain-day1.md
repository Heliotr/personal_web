---
title: "我的AI开发第一课：为什么选择LangChain"
slug: "langchain-why-choose"
description: "从零开始学LangChain，告诉你为什么需要它"
date: "2026-01-10"
tags:
  - "LangChain"
  - "AI"
  - "LLM"
  - "入门"
category: "技术分享"
readingTime: 9
---

## 01 写在前面

学完FastAPI后，我盯上了现在最火的AI应用开发。

问了GPT好几次，最后决定学LangChain。为啥？生态好、文档全、案例多呗！

这篇文章记录我的LangChain入门过程，希望能帮到同样想学AI开发的同学。

## 02 为什么需要LangChain？

直接调用大模型API不香吗？香！但问题也是真的多：

**问题1：每个模型API不一样**
```python
# OpenAI
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "你好"}]
)

# DeepSeek
response = deepseek.Chat.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "你好"}]
)

# 智谱
response = zhipu.ChatCompletion.create(
    model="glm-4",
    messages=[{"role": "user", "content": "你好"}]
)
```

换个大模型，代码要改一堆！

**问题2：提示词管理混乱**
```python
# 每次都要写很长的system prompt
messages = [
    {"role": "system", "content": "你是一个助手，要..."},
    {"role": "user", "content": "..."}
]
```

**问题3：没有记忆**
问完"我叫张三"，再问"我叫什么"，模型根本不知道。

**问题4：工具调用难**
让AI查天气、订机票，都要自己实现调用逻辑。

**LangChain就是来解决这些问题的！**

## 03 安装和环境

```bash
pip install langchain==1.2.0 langchain-deepseek langchain-openai langchain-community
```

配置API Key：
```bash
# .env
DEEPSEEK_API_KEY=sk-xxxx
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 04 第一个LangChain程序

```python
# env_utils.py
from dotenv import load_dotenv
import os
load_dotenv(override=True)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL")

# init_llm.py
from langchain.chat_models import init_chat_model

llm = init_chat_model(
    model="deepseek-chat",
    model_provider="deepseek",
    api_key=DEEPSEEK_API_KEY,
    base_url=DEEPSEEK_BASE_URL,
)

# 测试
print(llm.invoke("你好"))
```

**爽点**：换模型只需要改一个参数！

```python
# 换成智谱
llm = init_chat_model(model="glm-4", model_provider="zhipu", api_key="...")
```

## 05 三种调用方式

```python
# 1. invoke - 同步调用
response = llm.invoke("你好")
print(response.content)

# 2. stream - 流式输出（打字机效果）
for chunk in llm.stream("给我讲个笑话"):
    print(chunk.content, end="")

# 3. batch - 批量调用
responses = llm.batch(["你好", "今天天气怎么样", "推荐一部电影"])
for r in responses:
    print(r.content)
```

## 06 Message类型

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage("你是一个翻译助手，把英文翻译成中文"),
    HumanMessage("I love AI"),
    AIMessage("I love AI -> 我爱人工智能"),
    HumanMessage("翻译：大模型"),
]

response = llm.invoke(messages)
print(response.content)  # 大模型 -> Large Model 或者 大型语言模型
```

## 07 LangChain核心概念

1. **Models**：统一的大模型接口
2. **Prompts**：提示词模板
3. **Chains**：串联多个组件
4. **Agents**：能自主决策的智能体
5. **Memory**：记忆管理
6. **Tools**：工具调用

## 08 我的理解

LangChain就像一个"胶水框架"，把各种AI能力粘合在一起。

之前是：
- 想用DeepSeek？学DeepSeek API
- 想做记忆？自己写缓存
- 想调工具？自己写调用逻辑

现在是：
- 想用哪个模型？一行代码切换
- 想加记忆？几行代码搞定
- 想调工具？装饰器一写就行

**这就是抽象的力量！**

