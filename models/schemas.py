"""API 数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
import time


class GenerateRequest(BaseModel):
    """单张图片生成请求"""
    prompt: str = Field(..., description="图片生成提示词", min_length=1)
    text_content: Optional[str] = Field(
        None,
        description="额外的文本内容（可选）"
    )
    aspect_ratio: str = Field(
        default="1:1",
        description="图片宽高比",
        pattern="^(\\d+:\\d+)$"
    )
    reference_image: Optional[str] = Field(
        None,
        description="参考图片的 base64 数据（可选）"
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


# ===== 用户模板相关模型 =====


class UserTemplate(BaseModel):
    """用户自定义模板"""
    id: str = Field(..., description="模板唯一 ID")
    name: str = Field(..., description="模板名称", min_length=1, max_length=50)
    prompt: str = Field(..., description="提示词内容", min_length=1)
    prompt_only: Optional[str] = Field(None, description="纯提示词（不含文本内容）")
    text_content: Optional[str] = Field(None, description="文本内容")
    created_at: float = Field(default_factory=time.time, description="创建时间戳")
    updated_at: float = Field(default_factory=time.time, description="更新时间戳")


class CreateTemplateRequest(BaseModel):
    """创建模板请求"""
    name: str = Field(..., description="模板名称", min_length=1, max_length=50)
    prompt: str = Field(..., description="提示词内容", min_length=1)
    prompt_only: Optional[str] = Field(None, description="纯提示词（不含文本内容）")
    text_content: Optional[str] = Field(None, description="文本内容")


class TemplateListResponse(BaseModel):
    """模板列表响应"""
    templates: list[UserTemplate]
    total: int


class TemplateResponse(BaseModel):
    """模板响应"""
    success: bool
    template: Optional[UserTemplate] = None
    error: Optional[str] = None
