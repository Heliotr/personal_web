"""LLM 驱动的 JD 结构化提取"""

import json
import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import settings

logger = logging.getLogger(__name__)


class JDExtractor:
    """用 LLM 从非结构化的 JD 文本中提取结构化信息"""

    def __init__(self):
        self.client = None
        if settings.anthropic_api_key:
            from anthropic import Anthropic

            self.client = Anthropic(api_key=settings.anthropic_api_key)
            self.model = settings.anthropic_model

    def extract(self, raw_text: str) -> dict:
        """
        从原始 JD 文本中提取结构化信息

        返回:
            {
                "job_title": "职位名称",
                "company": "公司名",
                "salary_range": {"min": 20, "max": 40, "unit": "K"},
                "experience_years": "3-5年",
                "education": "本科",
                "skills": ["Python", "FastAPI", "LangChain"],
                "responsibilities": ["负责...", "参与..."],
                "requirements": ["熟悉...", "有...经验"],
                "benefits": ["五险一金", "双休"],
                "summary": "简要总结",
            }
        """
        if not self.client:
            return self._rule_based_extract(raw_text)

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                system="你是一个专业的招聘信息解析器。请从 JD 文本中提取结构化信息，只返回 JSON 格式。",
                messages=[
                    {
                        "role": "user",
                        "content": f"从以下 JD 中提取结构化信息：\n\n{raw_text[:4000]}",
                    }
                ],
            )

            text = response.content[0].text
            # 提取 JSON（LLM 可能返回 markdown 代码块）
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]

            return json.loads(text.strip())

        except Exception as e:
            logger.warning(f"LLM 提取失败: {e}，使用规则提取")
            return self._rule_based_extract(raw_text)

    def _rule_based_extract(self, raw_text: str) -> dict:
        """基于规则的提取（LLM 不可用时的兜底）"""
        result = {
            "job_title": "",
            "company": "",
            "salary_range": {},
            "experience_years": "",
            "education": "",
            "skills": [],
            "responsibilities": [],
            "requirements": [],
            "benefits": [],
            "summary": "",
        }

        lines = raw_text.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            # 提取薪资（如 20K-40K、15k-25k、20-40K）
            import re

            salary_match = re.search(
                r"(\d+\.?\d*)[kK]\s*[-~至到]\s*(\d+\.?\d*)[kK]", line
            )
            if salary_match:
                result["salary_range"] = {
                    "min": float(salary_match.group(1)),
                    "max": float(salary_match.group(2)),
                    "unit": "K",
                }

            # 提取技能（常见技术栈关键词）
            tech_keywords = [
                "Python", "Java", "Go", "JavaScript", "TypeScript",
                "FastAPI", "Flask", "Django", "Spring",
                "LangChain", "LangGraph", "Agent", "RAG",
                "React", "Vue", "Next.js",
                "Docker", "Kubernetes", "K8s",
                "MySQL", "PostgreSQL", "Redis", "MongoDB",
                "AWS", "Azure", "阿里云",
                "TensorFlow", "PyTorch",
                "Claude", "OpenAI", "LLM",
                "MCP", "AIGC",
            ]
            line_lower = line.lower()
            for tech in tech_keywords:
                if tech.lower() in line_lower and tech not in result["skills"]:
                    result["skills"].append(tech)

        result["summary"] = raw_text[:200]
        return result


class BatchExtractor:
    """批量提取 + 重试"""

    def __init__(self, extractor: JDExtractor):
        self.extractor = extractor

    def extract_batch(self, jd_list: list[dict]) -> list[dict]:
        """批量提取 JD 信息"""
        results = []
        for i, jd in enumerate(jd_list):
            logger.info(f"提取 [{i+1}/{len(jd_list)}]: {jd.get('title', '')}")
            try:
                extracted = self.extractor.extract(jd.get("raw_text", ""))
                extracted["source_url"] = jd.get("url", "")
                extracted["crawled_at"] = jd.get("crawled_at", "")
                results.append(extracted)
            except Exception as e:
                logger.error(f"提取失败: {e}")
                continue
        return results
