"""API 数据模型"""
from pydantic import BaseModel, Field
from typing import Optional


class GenerateRequest(BaseModel):
    """单张图片生成请求"""
    prompt: str = Field(..., description="图片生成提示词", min_length=1)
    aspect_ratio: str = Field(
        default="1:1",
        description="图片宽高比",
        pattern="^(\\d+:\\d+)$"
    )


class BatchGenerateRequest(BaseModel):
    """批量图片生成请求"""
    prompts: list[str] = Field(..., description="图片生成提示词列表", min_length=1)
    aspect_ratio: str = Field(
        default="1:1",
        description="图片宽高比",
        pattern="^(\\d+:\\d+)$"
    )


class GenerateResponse(BaseModel):
    """图片生成响应"""
    success: bool
    filename: Optional[str] = None
    path: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None
    prompt: Optional[str] = None


class BatchGenerateResponse(BaseModel):
    """批量图片生成响应"""
    success: bool
    results: list[GenerateResponse]
    total: int
    succeeded: int
    failed: int


class ImageInfo(BaseModel):
    """图片信息"""
    filename: str
    url: str
    created_at: float


class ImagesListResponse(BaseModel):
    """图片列表响应"""
    images: list[ImageInfo]
    total: int


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    app_name: str
    version: str
