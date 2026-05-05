"""JD 技能分析 + 报告生成"""

import json
import logging
from collections import Counter
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

logger = logging.getLogger(__name__)

# 设置中文字体
plt.rcParams["font.sans-serif"] = ["SimHei", "Microsoft YaHei", "PingFang SC"]
plt.rcParams["axes.unicode_minus"] = False


class JDAnalyzer:
    """分析 JD 数据，生成可视化报告"""

    def __init__(self, records: list[dict]):
        self.records = records

    def skill_frequency(self) -> Counter:
        """统计技能出现频率"""
        counter = Counter()
        for record in self.records:
            skills = record.get("skills", [])
            if isinstance(skills, str):
                skills = json.loads(skills)
            for skill in skills:
                counter[skill] += 1
        return counter

    def salary_stats(self) -> dict:
        """薪资统计"""
        salaries_min = []
        salaries_max = []
        for record in self.records:
            salary = record.get("salary_range", {})
            if isinstance(salary, str):
                salary = json.loads(salary)
            if salary.get("min"):
                salaries_min.append(salary["min"])
            if salary.get("max"):
                salaries_max.append(salary["max"])

        return {
            "avg_min": round(sum(salaries_min) / len(salaries_min), 1) if salaries_min else 0,
            "avg_max": round(sum(salaries_max) / len(salaries_max), 1) if salaries_max else 0,
            "min": min(salaries_min) if salaries_min else 0,
            "max": max(salaries_max) if salaries_max else 0,
            "sample_count": len(salaries_min),
        }

    def education_distribution(self) -> Counter:
        """学历要求分布"""
        counter = Counter()
        for record in self.records:
            edu = record.get("education", "")
            if edu:
                counter[edu] += 1
        return counter

    def experience_distribution(self) -> Counter:
        """经验要求分布"""
        counter = Counter()
        for record in self.records:
            exp = record.get("experience_years", "")
            if exp:
                # 归类：1-3年、3-5年、5-10年、10年+
                if any(k in exp for k in ["10", "10+" "10年以上"]):
                    counter["10年+"] += 1
                elif "5" in exp or "五" in exp:
                    counter["5-10年"] += 1
                elif "3" in exp or "三" in exp:
                    counter["3-5年"] += 1
                elif "1" in exp:
                    counter["1-3年"] += 1
                else:
                    counter[exp] += 1
        return counter

    def generate_report(self, output_dir: str = "data/reports") -> str:
        """生成完整的分析报告"""
        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)

        skills = self.skill_frequency()
        salary = self.salary_stats()
        edu = self.education_distribution()
        exp = self.experience_distribution()

        # 生成可视化
        self._plot_skill_chart(skills, out_path / "skill_demand.png", top_n=20)
        self._plot_salary_chart(salary, out_path / "salary_distribution.png")
        self._plot_education_chart(edu, out_path / "education_distribution.png")
        self._plot_experience_chart(exp, out_path / "experience_distribution.png")

        # 生成文本报告
        report = self._build_text_report(skills, salary, edu, exp)

        report_path = out_path / "jd_analysis_report.md"
        report_path.write_text(report, encoding="utf-8")

        logger.info(f"报告已生成: {report_path}")
        return str(report_path)

    def _plot_skill_chart(self, skills: Counter, output_path: Path, top_n: int = 20):
        """技能需求排行榜"""
        top_skills = skills.most_common(top_n)
        if not top_skills:
            return

        labels, values = zip(*top_skills)

        fig, ax = plt.subplots(figsize=(12, 8))
        colors = plt.cm.Blues([0.4 + 0.5 * i / len(labels) for i in range(len(labels))])
        bars = ax.barh(range(len(labels)), values, color=colors[::-1])
        ax.set_yticks(range(len(labels)))
        ax.set_yticklabels(labels, fontsize=10)
        ax.set_xlabel("出现次数", fontsize=12)
        ax.set_title(f"JD 技能需求 Top {top_n}", fontsize=14, fontweight="bold")
        ax.invert_yaxis()

        for bar, v in zip(bars, values):
            ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                    str(v), va="center", fontsize=9)

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()

    def _plot_salary_chart(self, salary: dict, output_path: Path):
        """薪资分布"""
        fig, ax = plt.subplots(figsize=(8, 5))
        categories = ["平均最低", "平均最高", "最低", "最高"]
        values = [salary["avg_min"], salary["avg_max"], salary["min"], salary["max"]]
        colors = ["#4A90D9", "#2ECC71", "#E74C3C", "#F39C12"]

        bars = ax.bar(categories, values, color=colors, width=0.5)
        ax.set_ylabel("薪资 (K/月)", fontsize=12)
        ax.set_title(f"薪资分析 (样本数: {salary['sample_count']})", fontsize=14, fontweight="bold")

        for bar, v in zip(bars, values):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1,
                    f"{v}K", ha="center", fontsize=11, fontweight="bold")

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()

    def _plot_education_chart(self, edu: Counter, output_path: Path):
        """学历分布"""
        if not edu:
            return
        fig, ax = plt.subplots(figsize=(8, 6))
        labels, values = zip(*edu.most_common())
        colors = ["#3498DB", "#2ECC71", "#F39C12", "#E74C3C", "#9B59B6"]

        wedges, texts, autotexts = ax.pie(
            values, labels=labels, autopct="%1.1f%%",
            colors=colors[:len(labels)], startangle=90,
        )
        ax.set_title("学历要求分布", fontsize=14, fontweight="bold")

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()

    def _plot_experience_chart(self, exp: Counter, output_path: Path):
        """经验要求分布"""
        if not exp:
            return
        fig, ax = plt.subplots(figsize=(8, 6))
        labels, values = zip(*exp.most_common())
        colors = ["#1ABC9C", "#3498DB", "#F39C12", "#E74C3C"]

        wedges, texts, autotexts = ax.pie(
            values, labels=labels, autopct="%1.1f%%",
            colors=colors[:len(labels)], startangle=90,
        )
        ax.set_title("经验要求分布", fontsize=14, fontweight="bold")

        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches="tight")
        plt.close()

    def _build_text_report(self, skills: Counter, salary: dict,
                           edu: Counter, exp: Counter) -> str:
        """生成 Markdown 格式的文本报告"""
        lines = []
        lines.append("# JD 数据分析报告\n")
        lines.append(f"> 分析样本数：{len(self.records)} 条\n")

        # 薪资概况
        lines.append("## 一、薪资概况\n")
        lines.append(f"- **平均薪资范围**：{salary['avg_min']}K - {salary['avg_max']}K")
        lines.append(f"- **最低薪资**：{salary['min']}K")
        lines.append(f"- **最高薪资**：{salary['max']}K\n")

        lines.append("![薪资分布](salary_distribution.png)\n")

        # 技能需求
        lines.append("## 二、技能需求 Top 20\n")
        lines.append("| 排名 | 技能 | 出现次数 |")
        lines.append("|------|------|---------|")
        for i, (skill, count) in enumerate(skills.most_common(20), 1):
            lines.append(f"| {i} | {skill} | {count} |")

        lines.append("\n![技能需求](skill_demand.png)\n")

        # 学历要求
        if edu:
            lines.append("## 三、学历要求\n")
            lines.append("| 学历 | 占比 |")
            lines.append("|------|------|")
            total = sum(edu.values())
            for level, count in edu.most_common():
                pct = count / total * 100
                lines.append(f"| {level} | {pct:.1f}% |")

            lines.append("\n![学历分布](education_distribution.png)\n")

        # 经验要求
        if exp:
            lines.append("## 四、经验要求\n")
            lines.append("| 经验 | 占比 |")
            lines.append("|------|------|")
            total = sum(exp.values())
            for level, count in exp.most_common():
                pct = count / total * 100
                lines.append(f"| {level} | {pct:.1f}% |")

            lines.append("\n![经验分布](experience_distribution.png)\n")

        # 目标岗位建议
        lines.append("## 五、面试准备建议\n")
        top_skills = skills.most_common(10)
        lines.append("根据当前市场需求，建议重点准备以下技能方向：\n")
        for i, (skill, count) in enumerate(top_skills, 1):
            proficiency = "★★★★★" if count > len(self.records) * 0.5 else \
                          "★★★★☆" if count > len(self.records) * 0.3 else \
                          "★★★☆☆" if count > len(self.records) * 0.1 else "★★☆☆☆"
            lines.append(f"{i}. **{skill}** {proficiency} (需求率: {count/len(self.records)*100:.0f}%)")

        return "\n".join(lines)
