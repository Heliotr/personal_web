---
title: "自动化爬虫 Agent 系统"
slug: "crawler-agent-system"
description: "基于LLM驱动的双爬虫Agent，包含JD市场分析爬虫和技术文档知识库爬虫，覆盖数据采集、结构化提取和智能分析全流程"
date: "2026-05-06"
status: "completed"
featured: true
thumbnail: "/images/projects/crawler-agent.png"

techStack:
  - "Python 3.11+"
  - "Playwright"
  - "httpx + BeautifulSoup"
  - "Claude API"
  - "SQLite"
  - "Matplotlib + Pandas"
  - "LangChain / LangGraph"

links:
  github: "https://github.com/Heliotr/personal_web"

highlights:
  - "JD爬虫Agent：Playwright自动化爬取BOSS直聘 + LLM结构化提取 + 技能分析报告"
  - "文档爬虫Agent：sitemap链接发现 + HTML转Markdown + 基于标题层级的智能切片"
  - "已构建约112万tokens的技术文档知识库（FastAPI/LangChain/LangGraph）"
  - "可视化分析报告：技能需求排行榜、薪资分布统计、学历/经验要求分布"
---

## 项目背景

在求职面试和技术学习过程中，两个痛点尤为突出：

1. **JD信息收集难**：招聘网站信息分散，手动收集岗位技能要求效率低，难以形成对市场需求的宏观判断
2. **技术文档检索不便**：官方文档分散在不同站点，排查问题时需要在多个站点间反复切换

为了解决这些问题，构建了两个自动化爬虫 Agent 系统：
- **JD爬虫 Agent**：自动采集招聘网站的岗位信息，用 LLM 提取技能要求，输出市场需求分析报告，指导面试准备
- **文档爬虫 Agent**：批量爬取技术文档站，转换为结构化 Markdown 知识库，为 RAG 问答系统提供数据基础

## 架构设计

### 双爬虫统一架构

两个爬虫共享相同的 Agent 驱动设计理念：

```
用户输入（关键词/文档URL）
       │
       ▼
┌──────────────────┐
│  Crawler Agent   │
│ (LLM 驱动的编排层) │
└──────┬───────────┘
       │
  ┌────┴────────┐
  │  数据采集层   │
  │ ┌─────────┐ │      ┌──────────────┐
  │ │ 浏览器/  │ │      │  LLM 驱动    │
  │ │ HTTP 模块│ │ ──── │  内容提取    │
  │ └─────────┘ │      └──────────────┘
  └────┬────────┘
       │
  ┌────┴────────┐      ┌──────────────┐
  │  数据存储    │ ──── │  输出/分析    │
  │ (SQLite/    │      │  (报告/      │
  │  Markdown)  │      │  知识库)     │
  └─────────────┘      └──────────────┘
```

### 为什么用 Agent 驱动而非普通爬虫？

```
普通爬虫：写死的提取规则 → 网站改版 → 爬虫挂 → 手动修复

Agent 爬虫：LLM 理解页面内容 → 自主提取关键信息 → 网站结构变化也能适应
→ 告诉 Agent "提取 JD 的技能要求"，它自己能找到在哪里
```

## JD 爬虫 Agent 实现

### 技术挑战与应对

| 挑战 | 应对方案 |
|---|---|
| 反爬机制（登录、验证码） | Playwright 浏览器自动化 + Cookie 持久化 + 人类行为模拟 |
| SPA 页面动态渲染 | Playwright 等待页面完全加载后再提取 |
| 数据结构不统一 | Claude API 从非结构化文本中提取结构化字段 |
| 反爬 IP 限制 | 请求间隔随机化 + 滚动/鼠标移动行为模拟 |

### 爬取流程

```
1. 首次运行：用户手动登录 BOSS 直聘
   → Cookie 持久化到本地文件
   → 后续自动加载 Cookie 跳过登录

2. Agent 按关键词和城市搜索
   → 提取列表页：公司/职位/薪资
   → 进入详情页：JD 描述/任职要求/福利
   → 自动翻页直到上限

3. LLM 结构化提取
   Claude API 从 JD 文本中提取：
   - 技能要求（Python/FastAPI/LangChain 等）
   - 经验年限、学历要求
   - 岗位职责、福利待遇
   → API 不可用时自动降级为规则提取

4. 分析报告输出
   - 技能需求排行榜（柱状图）
   - 薪资分布统计（柱状图）
   - 学历要求分布（饼图）
   - 经验要求分布（饼图）
   - 面试准备建议（带星级评分的技能推荐）
```

### 核心代码示例

```python
# LLM 驱动的结构化提取（extractor.py）
class JDExtractor:
    def extract(self, raw_text: str) -> dict:
        response = self.client.messages.create(
            model=self.model,
            system="你是一个专业的招聘信息解析器。请从 JD 文本中提取结构化信息，只返回 JSON 格式。",
            messages=[{"role": "user", "content": f"从以下 JD 中提取结构化信息：\n\n{raw_text[:4000]}"}],
        )
        return json.loads(self._parse_json(response.content[0].text))
```

## 文档爬虫 Agent 实现

### 技术选型

| 组件 | 选型 | 理由 |
|---|---|---|
| HTTP 爬取 | httpx | 异步高性能，支持连接复用 |
| HTML 解析 | BeautifulSoup + lxml | 成熟的解析生态 |
| Markdown 转换 | markdownify | 配置灵活，支持代码语言检测 |
| 切片引擎 | 自研（基于标题层级） | 保证语义完整性 |

### 爬取流程

```
1. 链接发现
   → 读取 sitemap.xml（优先）
   → 或解析导航栏发现所有文档链接（备选）
   → 按 allowed_prefixes 过滤

2. 逐页爬取 + 转换
   → 提取主要内容区域（CSS 选择器）
   → 移除导航/广告/脚注等无关元素
   → 相对链接转绝对链接
   → HTML → Markdown 转换（保留代码语言标记）

3. 智能切片
   以标题层级为切分边界：
   [页面标题] LangGraph Quick Start
     ├── [h1] Installation → 整个章节为一个切片
     ├── [h1] Basic Usage
     │   ├── [h2] Define State → 独立切片
     │   ├── [h2] Add Nodes
     │   └── [h2] Compile Graph
     └── [h1] Examples

   每个切片保留：
   - 完整的内容文本
   - 章节路径（LangGraph > Basic Usage > Define State）
   - 上级标题、代码语言类型
   - 合并过小段落（<50字符）到相邻切片
```

### 切片引擎实现

```python
# 基于标题层级的智能切片（chunker.py）
class DocChunker:
    def _parse_sections(self, markdown: str) -> list[dict]:
        """解析 Markdown 标题结构，以 h1/h2 切分"""
        sections = []
        for line in lines:
            if code_block:
                current_text.append(line); continue
            if match := heading_pattern.match(line):
                # 保存上一段
                sections.append({"heading": current_heading, "text": text})
                # 开始新段落
                current_heading = match.group(2)
            else:
                current_text.append(line)
        # 合并小段落
        return self._merge_small_sections(sections)
```

## 已构建的知识库

文档爬虫 Agent 已成功爬取以下技术文档，构建了约 **112 万 tokens** 的 RAG 知识库：

| 站点 | 页面数 | Chunks | Tokens |
|---|---|---|---|
| **FastAPI** | 152 | 2,910 | 777,556 |
| **LangChain** | 61 | 514 | 171,082 |
| **LangGraph** | 67 | 434 | 163,800 |
| **合计** | 280 | 3,858 | 1,112,438 |

知识库以结构化 Markdown 格式存储，每个切片独立文件 + chunks.json 全集索引 + index.json 元数据，可直接接入 RAG 框架使用。

## 项目亮点

- ✅ Agent 驱动设计：LLM 理解页面内容，自适应网站结构变化
- ✅ JD 爬虫：Playwright 自动化 + Cookie 持久化 + 人类行为模拟
- ✅ JD 分析：LLM 结构化提取 + 规则兜底双保险
- ✅ 文档爬虫：sitemap 发现 + HTML→Markdown 智能转换
- ✅ 智能切片：基于标题层级保持语义完整性
- ✅ 成本控制：LLM 只在需要理解语义时调用（列表页规则提取，详情页用 LLM）
- ✅ 约 112 万 tokens 的技术文档知识库
- ✅ 可视化报告：Matplotlib 生成技能/薪资/学历/经验分布图表
