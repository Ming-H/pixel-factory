"""Gemini 图片生成器"""
import asyncio
import base64
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
        # 使用 Gemini 3 Pro Image Preview 模型（Nano Banana Pro）
        self.model_name = "gemini-3-pro-image-preview"

    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        filename: Optional[str] = None,
        reference_image: Optional[str] = None
    ) -> dict:
        """
        生成单张图片

        Args:
            prompt: 提示词
            aspect_ratio: 宽高比，如 "1:1", "16:9", "9:16" 等
            filename: 输出文件名（可选）
            reference_image: 参考图片的 base64 数据（可选）

        Returns:
            包含图片信息的字典
        """
        if aspect_ratio not in settings.ASPECT_RATIOS:
            raise ValueError(f"不支持的宽高比: {aspect_ratio}")

        loop = asyncio.get_event_loop()

        try:
            # 构建内容列表
            contents = []

            # 构建完整的提示词
            aspect_ratio_prompts = {
                "1:1": "正方形 (1:1)",
                "16:9": "横向宽屏 (16:9)",
                "9:16": "竖向 (9:16)",
                "4:3": "横向 (4:3)",
                "3:4": "竖向 (3:4)",
                "21:9": "超宽屏 (21:9)",
                "9:21": "超长竖向 (9:21)"
            }

            # 如果有参考图片，先添加参考图片
            if reference_image:
                # 处理 base64 数据
                if ',' in reference_image:
                    reference_image = reference_image.split(',', 1)[1]

                # 解码 base64
                reference_image_bytes = base64.b64decode(reference_image)

                # 添加参考图片部分
                contents.append(
                    types.Part.from_bytes(
                        data=reference_image_bytes,
                        mime_type="image/png"
                    )
                )

                # 添加文本提示词
                text_prompt = f"这是参考图片。请根据这个参考图片的风格和内容，生成一张新图片。描述：{prompt}。图片宽高比要求：{aspect_ratio_prompts.get(aspect_ratio, aspect_ratio)}。"
                contents.append(types.Part(text=text_prompt))
            else:
                # 没有参考图片，直接使用提示词
                text_prompt = f"请生成一张图片。描述：{prompt}。图片宽高比要求：{aspect_ratio_prompts.get(aspect_ratio, aspect_ratio)}。"
                contents.append(types.Part(text=text_prompt))

            # 配置响应为图片格式
            config = types.GenerateContentConfig(
                response_modalities=["IMAGE"]
            )

            # 调用 Gemini 3 Pro Image Preview API
            response = await loop.run_in_executor(
                None,
                lambda: self.client.models.generate_content(
                    model=self.model_name,
                    contents=contents,
                    config=config
                )
            )

            # 检查响应中的图片
            if response.candidates and len(response.candidates) > 0:
                candidate = response.candidates[0]

                if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                    for part in candidate.content.parts:
                        if hasattr(part, 'inline_data'):
                            # inline_data 可能包含 bytes 或 base64 字符串
                            inline_data = part.inline_data

                            if hasattr(inline_data, 'data'):
                                raw_data = inline_data.data

                                # 处理数据（可能是 bytes 或 base64 字符串）
                                if isinstance(raw_data, bytes):
                                    image_data = raw_data
                                elif isinstance(raw_data, str):
                                    image_data = base64.b64decode(raw_data)
                                else:
                                    image_data = base64.b64decode(str(raw_data))

                                if image_data:
                                    return self._save_image(image_data, prompt, aspect_ratio, filename)

        except Exception as e:
            print(f"Gemini API failed: {e}")
            import traceback
            traceback.print_exc()

        return {
            "success": False,
            "error": "无法生成图片，请检查 API 密钥和模型配置",
            "prompt": prompt
        }

    def _save_image(self, image_data: bytes, prompt: str, aspect_ratio: str, filename: Optional[str] = None) -> dict:
        """保存图片并返回结果"""
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
