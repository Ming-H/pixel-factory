"""配置管理"""
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

class Settings:
    """应用配置"""

    # API 配置
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    # 使用 Gemini 3 Pro Image Preview 模型（Nano Banana Pro）
    GEMINI_MODEL: str = "gemini-3-pro-image-preview"

    # 应用配置
    APP_NAME: str = "Pixel Factory"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 文件路径配置
    BASE_DIR: Path = Path(__file__).parent
    OUTPUT_DIR: Path = BASE_DIR / "generated_images"
    STATIC_DIR: Path = BASE_DIR / "static"
    TEMPLATES_DIR: Path = BASE_DIR / "templates"
    TEMPLATES_DATA_DIR: Path = BASE_DIR / "data" / "templates"
    TEMPLATES_FILE: Path = TEMPLATES_DATA_DIR / "user_templates.json"

    # 支持的宽高比
    ASPECT_RATIOS: list[str] = ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"]

    def __init__(self):
        # 确保输出目录存在
        self.OUTPUT_DIR.mkdir(exist_ok=True)
        # 确保模板数据目录存在
        self.TEMPLATES_DATA_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
