"""Gemini 图片生成器"""
import asyncio
from pathlib import Path
from typing import Optional

from google import genai
from google.genai import types

from config import settings


class GeminiImageGenerator:
    """Gemini 图片生成器（异步版本）"""

    def __init__(self, api_key: Optional[str] = None):
        """初始化 Gemini API 客户端"""
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY 未设置")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = settings.GEMINI_MODEL

    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        filename: Optional[str] = None
    ) -> dict:
        """
        生成单张图片

        Args:
            prompt: 提示词
            aspect_ratio: 宽高比，如 "1:1", "16:9", "9:16" 等
            filename: 输出文件名（可选）

        Returns:
            包含图片信息的字典
        """
        if aspect_ratio not in settings.ASPECT_RATIOS:
            raise ValueError(f"不支持的宽高比: {aspect_ratio}")

        # 在线程池中执行同步的 API 调用
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio=aspect_ratio,
                    ),
                ),
            )
        )

        # 提取图片数据
        if response.parts:
            for part in response.parts:
                if part.inline_data:
                    image_data = part.inline_data.data

                    # 确定输出路径
                    if filename:
                        output_path = settings.OUTPUT_DIR / filename
                    else:
                        existing_count = len(list(settings.OUTPUT_DIR.glob('*.png')))
                        output_path = settings.OUTPUT_DIR / f"image_{existing_count + 1}.png"

                    # 保存图片
                    output_path.write_bytes(image_data)

                    return {
                        "success": True,
                        "filename": output_path.name,
                        "path": str(output_path),
                        "prompt": prompt,
                        "aspect_ratio": aspect_ratio
                    }

        return {
            "success": False,
            "error": "未收到有效的响应",
            "prompt": prompt
        }

    async def generate_batch(
        self,
        prompts: list[str],
        aspect_ratio: str = "1:1"
    ) -> list[dict]:
        """
        批量生成图片

        Args:
            prompts: 提示词列表
            aspect_ratio: 宽高比

        Returns:
            生成结果列表
        """
        tasks = [
            self.generate_image(prompt, aspect_ratio)
            for prompt in prompts
        ]
        return await asyncio.gather(*tasks)

    def get_generated_images(self) -> list[dict]:
        """
        获取已生成的图片列表

        Returns:
            图片信息列表
        """
        images = []
        for path in sorted(settings.OUTPUT_DIR.glob('*.png')):
            images.append({
                "filename": path.name,
                "url": f"/api/images/{path.name}",
                "created_at": path.stat().st_mtime
            })
        return images
