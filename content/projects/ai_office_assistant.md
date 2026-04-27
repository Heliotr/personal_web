---
title: "AI办公助手 - 自动化办公智能体系统"
slug: "ai-office-assistant"
description: "基于模块化架构的AI办公助手，提供文档处理、邮件发送、发票OCR、周报汇总等自动化办公服务"
date: "2026-04-27"
status: "in_progress"
featured: true
thumbnail: "/images/projects/ai-office-assistant.png"

techStack:
  - "Python 3.10+"
  - "Streamlit"
  - "LangGraph"
  - "PostgreSQL"
  - "百度云OCR"
  - "SQLAlchemy"

links:
  demo: "http://localhost:8501"
  github: "https://github.com/Heliotr/ai-office-assistant"

highlights:
  - "模块化DDD架构设计，易于扩展"
  - "支持Excel/Word/PDF/CSV多格式文档处理"
  - "自动化工作流引擎"
  - "飞书/企业微信机器人集成"
---

## 项目背景

在现代办公环境中，员工需要处理大量重复性文档任务，如汇总周报、录入发票、发送通知等。这些工作耗时且容易出错。
本项目旨在构建一个基于模块化架构的AI办公助手，通过自然语言与自动化引擎，帮助团队完成文档处理、信息汇总、消息通知等日常事务，
大幅减少重复性手工操作，提升办公效率。

系统采用领域驱动设计（DDD）架构，将系统划分为清晰的业务领域，每个领域独立内聚，通过接口通信，确保代码的高可维护性和可扩展性。

## 技术实现

### 模块化架构设计

系统采用五层架构：

```
Presentation Layer (Streamlit UI)
    │
Application Layer (Use Cases / Services)
    │
Domain Layer (Entities, Interfaces, Domain Services)
    │
Infrastructure Layer (Excel, Email, IM, OCR, Storage)
    │
Common Layer (Exceptions, Logging, Security)
```

- **Domain Layer**: 核心业务逻辑，定义实体、接口和领域服务，不依赖任何具体实现
- **Application Layer**: 用例编排，通过依赖注入获取Domain服务
- **Infrastructure Layer**: 具体实现（Excel读写、SMTP发送、百度OCR等）
- **Presentation Layer**: Streamlit可视化界面
- **Common Layer**: 公共工具（异常、日志、加密）

### 核心接口设计

定义清晰的抽象接口：

```python
class DocumentReader(ABC):
    @abstractmethod
    def read(self, source: str | BinaryIO, options: ReadOptions) -> DocumentContent: ...

class EmailSender(ABC):
    @abstractmethod
    def send(self, message: EmailMessage) -> SendResult: ...

class OCRService(ABC):
    @abstractmethod
    def recognize_invoice(self, image_source: str | bytes) -> OCRResult: ...
```

### 工作流引擎

基于APScheduler的自动化任务调度：
- 支持手动、定时、文件监听三种触发方式
- 步骤级执行，支持依赖关系
- 执行日志完整记录可回溯

### 飞书/企业微信机器人

Webhook方式接入企业IM：
- 支持文本、Markdown、富文本卡片消息
- 支持@机器人指令交互
- 返回处理结果卡片并支持文件下载

### 数据持久化

基于PostgreSQL + SQLAlchemy：
- 任务表、工作流表、配置表、日志表
- Alembic数据库迁移管理
- Repository模式封装数据访问

## 项目预期成果

- ✅ 完成模块化DDD架构设计与基础设施搭建
- ✅ 实现Excel/Word/PDF/CSV多格式文档处理能力
- ✅ 实现SMTP邮件自动发送功能
- ✅ 实现百度云OCR发票识别功能
- ✅ 实现周报汇总自动化流程
- ✅ 完成飞书/企业微信机器人集成
- ✅ 完成自动化工作流引擎
- ✅ 提供Streamlit可视化操作界面
- ✅ 实现定时任务自动调度
- ✅ 完善日志中心和错误处理