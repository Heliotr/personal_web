---
title: "PaperQA & Draft Generator - AI 论文写作助手"
slug: "paperqa-draft-generator"
description: "基于 Agentic RAG + Multi-Agent 架构的 AI 论文写作助手，提供论文知识库问答、代码解析、论文初稿生成等一站式服务"
date: "2026-02-27"
status: "completed"
featured: true
thumbnail: "/images/projects/paperqa.png"

techStack:
  - "Python"
  - "FastAPI"
  - "LangGraph"
  - "OpenAI API"
  - "ChromaDB"
  - "LangChain"

links:
  demo: "http://localhost:8000/docs"
  github: "https://github.com/Heliotr/PaperQA-Draft-Generator"

highlights:
  - "多智能体协同工作架构 (Orchestrator + 7 个专业 Agent)"
  - "LangGraph StateGraph 实现迭代式 RAG"
  - "支持论文知识库问答、代码解析、初稿生成全流程"
  - "流式响应支持，改善用户体验"
---

## 项目背景

在学术研究和论文写作过程中，研究者需要查阅大量文献、理解和分析代码实现、并最终完成论文初稿。传统方式下，这些工作需要大量的人工时间和精力。

本项目旨在构建一个基于大语言模型的 AI 论文写作助手系统，通过 Agentic RAG + Multi-Agent 架构，为用户提供论文知识库问答、代码与论文双重解析、论文初稿生成等一站式服务。

系统采用 LangGraph 框架构建多智能体架构，由 Orchestrator 协调器统筹管理，多个专业 Agent 协同工作，实现从查询理解到答案生成的完整流程。

## 技术实现

### 多智能体架构设计

系统采用层级式多智能体架构：

```
Orchestrator (协调器)
├── Query Agent (查询分析)
├── Retrieval Agent (混合检索)
├── Generation Agent (答案生成)
├── Code Analyzer Agent (代码分析)
├── Draft Generator Agent (初稿生成)
├── Citation Agent (引用管理)
├── Quality Check Agent (质量检查)
└── Format Analyst Agent (格式分析)
```

Orchestrator 负责意图分类和任务路由，根据用户查询类型将任务分发给对应的专业 Agent，实现专业分工与高效协作。

### LangGraph 工作流编排

使用 LangGraph 构建状态管理工作流：
- **State 管理**: 定义全局状态，包含查询、检索结果、生成内容、质量分数等
- **节点定义**: 每个 Agent 作为一个节点，处理特定类型的任务
- **条件边**: 根据检索质量动态决定是否需要重新检索
- **迭代式 RAG**: 实现"检索-评估-重写"闭环，最多支持 3 次迭代

### 核心功能实现

#### 1. 论文知识库问答 (PaperQA)
- PDF 文档解析与语义分块
- ChromaDB 向量存储
- 混合检索（向量检索 + 关键词检索 + RRF 融合）
- 引用溯源，自动标注信息来源

#### 2. 代码 + 论文双重解析
- 支持 Python、JavaScript、Java 等多语言
- 结合论文知识库理解代码与学术概念的关联
- 自动生成代码说明文档

#### 3. 论文初稿生成
- 格式学习与模板生成
- 大纲智能生成
- 章节内容自动撰写
- 参考文献管理

#### 4. 迭代式 RAG
- 查询重写与扩展
- 检索质量评估（LLM 判断）
- 自动重写查询优化检索效果
- 最多 3 次迭代

### API 服务层

基于 FastAPI 构建 RESTful API：
- 支持流式响应 (Server-Sent Events)
- 提供 Swagger 文档 (`/docs`)
- 统一的错误处理和日志记录

### 性能优化

- LLM 请求超时配置（300 秒）
- 自动重试机制（最多 3 次）
- 连接池管理

## 项目成果

- ✅ 完成多智能体架构设计与实现（8 个专业 Agent）
- ✅ 实现论文知识库问答、代码解析、初稿生成三大核心服务
- ✅ 集成 LangGraph StateGraph，支持迭代式 RAG
- ✅ 提供 FastAPI 接口，支持流式响应
- ✅ 所有功能通过测试验证

### 测试结果

| 功能 | 状态 | 耗时 |
|:-----|:----:|:----:|
| QA 工作流 | ✅ | ~20s |
| Draft 工作流 | ✅ | ~170s |
| Code 工作流 | ✅ | ~25s |
| MultiAgentWorkflow | ✅ | ~22s |
| 流式输出 | ✅ | ~33s |

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/paperqa.git
cd paperqa

# 2. 创建虚拟环境
python -m venv .venv
.venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
# 创建 .env 文件，添加 OPENAI_API_KEY

# 5. 启动服务
python -m uvicorn app.main:app --reload --port 8000
```

访问 http://localhost:8000/docs 查看 API 文档。