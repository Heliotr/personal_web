---
title: "AI旅行助手 - 多智能体旅行客服系统"
slug: "ai-travel-assistant"
description: "基于 LangGraph 的多智能体旅行客服系统，提供航班、酒店、租车、景点推荐等一站式服务"
date: "2025-8-25"
status: "completed"
featured: true
thumbnail: "/images/projects/ai-travel-assistant.png"

techStack:
  - "Python"
  - "FastAPI"
  - "LangGraph"
  - "LangChain"
  - "Vue 3"
  - "Streamlit"

links:
  demo: "http://localhost:8000/docs"
  github: "https://github.com/Heliotr/ai-travel-assistant"

highlights:
  - "多智能体协同工作架构"
  - "支持航班/酒店/租车/景点全流程服务"
  - "多轮对话上下文保持"
---

## 项目背景

随着旅游行业的快速发展，用户对旅行服务的需求日益多样化和个性化。传统的单一点式服务已无法满足用户一站式旅行规划的需求。
本项目旨在构建一个基于大语言模型的多智能体旅行客服系统，通过智能协作的方式为用户提供航班查询预订、酒店搜索预订、租车服
务、景点推荐等全方位旅行服务。

系统采用 LangGraph 框架构建多智能体架构，由一个主管 Agent (supervisor) 协调多个专业子 Agent，每个子 Agent
负责特定领域的任务，实现专业分工与高效协作。

## 技术实现

### 多智能体架构设计

系统采用层级式多智能体架构：

```
supervisor (主管Agent)
├── research_agent (网络搜索)
├── flight_booking_agent (航班服务)
├── hotel_booking_agent (酒店服务)
├── car_rental_booking_agent (租车服务)
└── excursion_booking_agent (景点推荐)
```

主管 Agent 负责理解用户意图，将任务分发给对应的专业子 Agent，并整合各子 Agent 的结果返回给用户。子 Agent
执行完成后返回 supervisor 进行总结，保证多轮对话的上下文连续性。

### LangGraph 工作流编排

使用 LangGraph 构建状态管理工作流：
- **State 管理**: 定义全局状态，包含消息历史、当前任务等信息
- **节点定义**: 每个 Agent 作为一个节点，处理特定类型的任务
- **边与条件路由**: 根据用户意图动态路由到对应的子 Agent
- **Command 模式**: 支持子 Agent 返回结果给 supervisor，实现多轮对话

### 业务工具集成

为每个专业 Agent 配备相应的业务工具：
- **航班工具**: 航班查询、改签、取消
- **酒店工具**: 位置搜索（支持区域名称匹配）、酒店预订管理
- **租车工具**: 车辆搜索、预订、修改、取消
- **景点工具**: 智能推荐旅游景点
- **网络搜索工具**: 接入智谱 AI 搜索 API 获取实时信息

### API 服务层

基于 FastAPI 构建 RESTful API：
- 支持流式响应
- 集成 LangGraph Checkpointer 实现会话持久化
- 提供 Swagger 文档 (`/docs`)

### 前端界面

提供两种前端：
- **Vue 3 前端**: 生产级 Web 界面
- **Streamlit 测试界面**: 纯白色简洁风格，便于快速测试

## 项目成果

- ✅ 完成多智能体架构设计与实现
- ✅ 实现航班、酒店、租车、景点四大核心服务
- ✅ 优化多轮对话，子 Agent 执行后返回 supervisor 总结，保持上下文连续性
- ✅ 修复酒店位置搜索问题，支持区域名称模糊匹配
- ✅ 提供 FastAPI 接口和 Streamlit 测试界面