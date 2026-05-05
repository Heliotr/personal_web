from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # 文档爬虫配置
    doc_output_dir: str = "knowledge"
    max_concurrent_pages: int = 5
    request_delay: float = 0.5  # 秒

    # JD 爬虫配置
    jd_output_dir: str = "data/jd_records"
    report_dir: str = "data/reports"
    max_pages: int = 5
    search_delay: tuple[float, float] = (3.0, 6.0)  # 随机延迟范围

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
