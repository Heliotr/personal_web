"""JD 数据存储"""

import json
import sqlite3
from datetime import datetime
from pathlib import Path


class JDStorage:
    """JD 数据存储，支持 SQLite + JSON 两种方式"""

    def __init__(self, db_path: str = "data/jd_records/jd_records.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self):
        """初始化数据库"""
        conn = sqlite3.connect(str(self.db_path))
        conn.execute("""
            CREATE TABLE IF NOT EXISTS jd_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_title TEXT,
                company TEXT,
                salary_min REAL,
                salary_max REAL,
                salary_unit TEXT,
                experience_years TEXT,
                education TEXT,
                skills TEXT,          -- JSON list
                city TEXT,
                source TEXT,          -- 来源网站
                source_url TEXT UNIQUE, -- JD 链接
                raw_text TEXT,
                summary TEXT,
                crawled_at TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # 索引
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_jd_source ON jd_records(source)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_jd_job_title ON jd_records(job_title)
        """)
        conn.commit()
        conn.close()

    def save(self, record: dict) -> bool:
        """保存一条 JD 记录（去重）"""
        skills_json = json.dumps(record.get("skills", []), ensure_ascii=False)
        salary = record.get("salary_range", {})

        try:
            conn = sqlite3.connect(str(self.db_path))
            conn.execute(
                """
                INSERT OR IGNORE INTO jd_records
                    (job_title, company, salary_min, salary_max, salary_unit,
                     experience_years, education, skills, city, source,
                     source_url, raw_text, summary, crawled_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    record.get("job_title", ""),
                    record.get("company", ""),
                    salary.get("min"),
                    salary.get("max"),
                    salary.get("unit", ""),
                    record.get("experience_years", ""),
                    record.get("education", ""),
                    skills_json,
                    record.get("city", ""),
                    record.get("source", ""),
                    record.get("source_url", ""),
                    record.get("raw_text", ""),
                    record.get("summary", ""),
                    record.get("crawled_at", datetime.now().isoformat()),
                ),
            )
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"[ERROR] 保存失败: {e}")
            return False

    def save_batch(self, records: list[dict]) -> tuple[int, int]:
        """批量保存，返回 (成功数, 总数十)"""
        success = 0
        for record in records:
            if self.save(record):
                success += 1
        return success, len(records)

    def get_all(self) -> list[dict]:
        """获取所有记录"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT * FROM jd_records ORDER BY crawled_at DESC"
        ).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def get_stats(self) -> dict:
        """获取统计信息"""
        conn = sqlite3.connect(str(self.db_path))
        stats = {}
        stats["total"] = conn.execute("SELECT COUNT(*) FROM jd_records").fetchone()[0]
        stats["sources"] = conn.execute(
            "SELECT source, COUNT(*) as cnt FROM jd_records GROUP BY source"
        ).fetchall()
        stats["by_city"] = conn.execute(
            "SELECT city, COUNT(*) as cnt FROM jd_records WHERE city != '' GROUP BY city"
        ).fetchall()
        conn.close()
        return stats

    def export_json(self, output_path: str = "data/jd_records/all_jd.json"):
        """导出全部数据为 JSON"""
        records = self.get_all()
        # skills 字段从 JSON 字符串转回列表
        for record in records:
            if isinstance(record.get("skills"), str):
                record["skills"] = json.loads(record["skills"])
        path = Path(output_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps(records, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return str(path)
