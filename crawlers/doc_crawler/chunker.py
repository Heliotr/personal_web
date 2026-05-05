"""智能切片引擎——基于标题层级保持语义完整性"""

import json
import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class DocChunker:
    """
    基于标题层级做智能切片。

    策略：
    - 以 h1/h2 为切片边界
    - 每个切片保留完整的上下文（父标题链）
    - 代码块不被切断
    - 太小（<50字）的切片并入相邻切片
    """

    def __init__(self, min_chunk_size: int = 100, max_chunk_size: int = 3000):
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size

    def chunk_document(self, doc: dict) -> list[dict]:
        """
        将一篇文档切片

        输入: converter 输出的结构化文档
        输出: 切片列表，每个切片包含文本 + 元数据
        """
        markdown = doc["content"]
        url = doc["url"]
        doc_title = doc["title"]

        # 解析标题结构
        sections = self._parse_sections(markdown)

        # 生成切片
        chunks = []
        for section in sections:
            text = section["text"]
            # 跳过太小的段落
            if len(text.strip()) < self.min_chunk_size and section != sections[-1]:
                continue

            # 构建父标题链
            heading_path = self._build_heading_path(section)
            full_path = f"{doc_title} > {heading_path}" if heading_path else doc_title

            chunk = {
                "content": text,
                "metadata": {
                    "source_url": url,
                    "doc_title": doc_title,
                    "heading": section["heading"],
                    "heading_path": full_path,
                    "heading_level": section["level"],
                    "section_id": section.get("id", ""),
                },
                "token_estimate": self._estimate_tokens(text),
            }
            chunks.append(chunk)

        return chunks

    def _parse_sections(self, markdown: str) -> list[dict]:
        """
        解析 Markdown 的标题结构。

        返回: [{heading, level, id, text}]
        """
        heading_pattern = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)
        lines = markdown.split("\n")

        sections = []
        current_heading = ""
        current_level = 1
        current_id = ""
        current_text: list[str] = []
        in_code_block = False

        for line in lines:
            # 代码块内跳过标题解析
            if line.strip().startswith("```"):
                in_code_block = not in_code_block
                current_text.append(line)
                continue

            if in_code_block:
                current_text.append(line)
                continue

            match = heading_pattern.match(line)
            if match:
                # 保存上一段
                if current_text:
                    text = "\n".join(current_text).strip()
                    if text:
                        sections.append({
                            "heading": current_heading,
                            "level": current_level,
                            "id": current_id,
                            "text": text,
                        })

                # 新标题
                current_heading = match.group(2)
                current_level = len(match.group(1))
                current_id = self._heading_to_id(current_heading)
                current_text = [line]
            else:
                current_text.append(line)

        # 最后一段
        if current_text:
            text = "\n".join(current_text).strip()
            if text:
                sections.append({
                    "heading": current_heading,
                    "level": current_level,
                    "id": current_id,
                    "text": text,
                })

        # 合并小段落
        merged = self._merge_small_sections(sections)
        return merged

    def _merge_small_sections(self, sections: list[dict]) -> list[dict]:
        """将过小的切片合并到前一个切片"""
        if not sections:
            return sections

        merged = [sections[0]]
        for section in sections[1:]:
            # 如果是 h1 或内容足够大，不合并
            if section["level"] == 1 or len(section["text"]) >= self.min_chunk_size:
                merged.append(section)
            else:
                # 合并到前一个
                merged[-1]["text"] += "\n\n" + section["text"]
        return merged

    def _build_heading_path(self, section: dict) -> str:
        """构建标题路径，如 '基本使用 > 定义状态'"""
        return section.get("heading", "")

    def _heading_to_id(self, heading: str) -> str:
        """标题转 ID"""
        return re.sub(r"[^\w一-鿿]+", "-", heading).strip("-").lower()

    def _safe_filename(self, name: str) -> str:
        """将标题转为安全的文件名"""
        # 移除 Markdown 链接标记 [text](url)
        safe = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', name)
        # 移除 ¶ 等特殊符号
        safe = re.sub(r'[¶†‡§]', '', safe)
        # 移除非法文件名字符
        safe = re.sub(r'[<>:"/\\|?*]', '', safe)
        # 空格和标点转下划线
        safe = re.sub(r'[\s,，。、；：！？()（）]+', '_', safe)
        # 限制长度
        safe = safe.strip('_')[:80]
        return safe or "untitled"

    def _estimate_tokens(self, text: str) -> int:
        """估算 token 数量（中英混合粗略估计）"""
        # 中文约 1.5 字符/token，英文约 4 字符/token
        chinese_chars = len(re.findall(r"[一-鿿]", text))
        other_chars = len(text) - chinese_chars
        return int(chinese_chars / 1.5 + other_chars / 4)

    def save_chunks(self, chunks: list[dict], output_dir: str, site_name: str):
        """保存切片到文件"""
        out_path = Path(output_dir) / site_name
        out_path.mkdir(parents=True, exist_ok=True)

        # 保存切片
        chunks_file = out_path / "chunks.json"
        with open(chunks_file, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        # 单独保存每个切片为 Markdown 文件（便于 RAG 直接使用）
        chunks_dir = out_path / "chunks"
        chunks_dir.mkdir(exist_ok=True)

        for i, chunk in enumerate(chunks):
            safe_name = f"{i:04d}_{self._safe_filename(chunk['metadata']['heading'] or f'chunk_{i}')}.md"
            file_path = chunks_dir / safe_name

            md_content = (
                f"---\n"
                f"source: {chunk['metadata']['source_url']}\n"
                f"doc_title: {chunk['metadata']['doc_title']}\n"
                f"heading: {chunk['metadata']['heading']}\n"
                f"heading_path: {chunk['metadata']['heading_path']}\n"
                f"---\n\n"
                f"{chunk['content']}\n"
            )
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(md_content)

        # 生成索引
        index = {
            "site": site_name,
            "total_chunks": len(chunks),
            "total_tokens": sum(c["token_estimate"] for c in chunks),
            "source": chunks[0]["metadata"]["source_url"] if chunks else "",
        }
        index_file = out_path / "index.json"
        with open(index_file, "w", encoding="utf-8") as f:
            json.dump(index, f, ensure_ascii=False, indent=2)

        logger.info(f"已保存 {len(chunks)} 个切片到 {out_path}")
        return out_path


