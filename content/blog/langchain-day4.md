---
title: "如何写出AI不会用错的工具：我的工具开发踩坑记"
slug: "langchain-tools-development"
description: "Tool装饰器、Pydantic验证、错误处理，工具开发全攻略"
date: "2026-01-31"
tags:
  - "LangChain"
  - "Tools"
  - "工具开发"
category: "技术分享"
readingTime: 8
---

## 01 教训

之前我写了这样一个工具：

```python
@tool
def query_order(order_id):
    """查询订单"""
    db = {"T001": "已发货"}
    return db.get(order_id, "订单不存在")
```

结果AI调用时经常报错：
- 传入空字符串 → 查不到
- 传入不存在的ID → 返回"订单不存在"但没告诉AI是参数问题还是数据问题
- 网络超时 → 直接崩溃

痛定思痛，好好学了一下午Tool开发规范。

## 02 @tool装饰器基础

```python
from langchain.tools import tool

@tool
def query_order(order_id: str) -> str:
    """根据订单ID查询订单状态
    
    Args:
        order_id: 订单号，如"T001"
    
    Returns:
        订单状态信息字符串
    """
    db = {"T001": "已发货", "T002": "待付款"}
    return db.get(order_id, "订单不存在")

# 手动指定工具名
@tool("query_order")
def get_order(order_id: str) -> str:
    ...
```

**要点**：docstring要写清楚参数和返回值，AI靠这个理解工具怎么用！

## 03 Pydantic参数验证

让AI传入的参数必须是合法的：

```python
from pydantic import BaseModel, Field
from typing import Literal

class OrderQueryInput(BaseModel):
    order_id: str = Field(description="订单ID")
    status_filter: Literal["all", "shipped", "pending"] = Field(default="all")

@tool(args_schema=OrderQueryInput)
def query_order(order_id: str, status_filter: str = "all") -> str:
    """查询订单状态"""
    db = {"T001": "已发货", "T002": "待付款"}
    result = db.get(order_id, "订单不存在")
    return result
```

这样AI传入的参数会被自动验证，不合法会报错。

## 04 工具描述的重要性

好的描述让AI知道什么时候该用这个工具：

```python
@tool
def calculate(route: str, origin: list, destination: list) -> str:
    """使用地图服务计算两个地点之间的路线和距离。
    
    当用户问以下问题时使用：
    - "从A到B怎么走"
    - "A到B有多远"
    - "从A到B要多久"
    - "推荐从A到B的路线"
    
    注意：需要用户提供有效的经纬度坐标。
    
    Args:
        route: 路线类型，必须是 driving/walking/bicycling/transit 之一
        origin: 起点坐标 [纬度, 经度]
        destination: 终点坐标 [纬度, 经度]
    
    Returns:
        路线信息，包含距离和预计时间
    """
    pass
```

**技巧**：写清楚使用场景，AI就知道什么时候该调用这个工具。

## 05 错误处理

工具调用失败不能直接崩，要优雅地返回错误：

```python
from langchain.agents.middleware import wrap_tool_call
from langchain.messages import ToolMessage

@wrap_tool_call
def handle_error(request, handler):
    try:
        return handler(request)
    except Exception as e:
        return ToolMessage(
            content=f"工具执行失败：{str(e)}，请检查参数后重试",
            tool_call_id=request.tool_call["id"]
        )

agent = create_agent(
    model=llm,
    tools=[query_order],
    middleware=[handle_error]
)
```

## 06 总结

1. **docstring要详细**：参数、返回值、使用场景都要写
2. **Pydantic验证**：保证AI传入的参数合法
3. **错误要捕获**：工具崩了不能影响Agent运行
4. **描述要精准**：让AI知道什么时候该用这个工具

```python
# 好的Tool规范示例
@tool
def search_products(keyword: str, category: str = None, min_price: float = None, max_price: float = None) -> list[dict]:
    """搜索商品信息
    
    当用户想查找商品、搜索产品时使用此工具。
    
    Args:
        keyword: 搜索关键词，必填
        category: 商品分类，可选（手机/电脑/服装/食品）
        min_price: 最低价格，可选
        max_price: 最高价格，可选
    
    Returns:
        商品列表，每项包含 id, name, price, category
    """
    # 实现逻辑
    pass
```

