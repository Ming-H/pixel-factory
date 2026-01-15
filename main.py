"""Pixel Factory - 图像产出工厂"""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from config import settings
from generators.gemini import GeminiImageGenerator
from services.template_service import TemplateService
from models.schemas import (
    GenerateRequest,
    GenerateResponse,
    BatchGenerateRequest,
    BatchGenerateResponse,
    ImagesListResponse,
    ImageInfo,
    HealthResponse,
    CreateTemplateRequest,
    TemplateListResponse,
    TemplateResponse,
    UserTemplate
)


# 全局生成器实例
generator: GeminiImageGenerator | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global generator
    # 启动时初始化
    generator = GeminiImageGenerator()
    # 初始化模板服务
    app.state.template_service = TemplateService()
    yield
    # 关闭时清理
    generator = None


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# 挂载静态文件和模板
app.mount("/static", StaticFiles(directory=str(settings.STATIC_DIR)), name="static")
app.mount("/generated_images", StaticFiles(directory=str(settings.OUTPUT_DIR)), name="generated_images")
templates = Jinja2Templates(directory=str(settings.TEMPLATES_DIR))


@app.get("/")
async def index(request: Request):
    """首页 - Web 界面"""
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "app_name": settings.APP_NAME,
            "aspect_ratios": settings.ASPECT_RATIOS
        }
    )


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return HealthResponse(
        status="ok",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION
    )


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_image(request: GenerateRequest):
    """
    生成单张图片

    Args:
        request: 图片生成请求

    Returns:
        生成结果
    """
    if not generator:
        raise HTTPException(status_code=503, detail="生成器未初始化")

    result = await generator.generate_image(
        prompt=request.prompt,
        aspect_ratio=request.aspect_ratio,
        reference_image=request.reference_image
    )

    if result["success"]:
        return GenerateResponse(
            success=True,
            filename=result["filename"],
            path=result["path"],
            url=f"/api/images/{result['filename']}",
            prompt=result["prompt"]
        )
    else:
        return GenerateResponse(
            success=False,
            error=result.get("error", "生成失败"),
            prompt=request.prompt
        )


@app.post("/api/generate/batch", response_model=BatchGenerateResponse)
async def generate_batch(request: BatchGenerateRequest):
    """
    批量生成图片

    Args:
        request: 批量生成请求

    Returns:
        批量生成结果
    """
    if not generator:
        raise HTTPException(status_code=503, detail="生成器未初始化")

    results = await generator.generate_batch(
        prompts=request.prompts,
        aspect_ratio=request.aspect_ratio
    )

    response_results = []
    succeeded = 0
    failed = 0

    for result in results:
        if result["success"]:
            response_results.append(GenerateResponse(
                success=True,
                filename=result["filename"],
                path=result["path"],
                url=f"/api/images/{result['filename']}",
                prompt=result["prompt"]
            ))
            succeeded += 1
        else:
            response_results.append(GenerateResponse(
                success=False,
                error=result.get("error", "生成失败"),
                prompt=result["prompt"]
            ))
            failed += 1

    return BatchGenerateResponse(
        success=failed == 0,
        results=response_results,
        total=len(results),
        succeeded=succeeded,
        failed=failed
    )


@app.get("/api/images", response_model=ImagesListResponse)
async def list_images():
    """
    获取已生成的图片列表

    Returns:
        图片列表
    """
    if not generator:
        raise HTTPException(status_code=503, detail="生成器未初始化")

    images = generator.get_generated_images()
    return ImagesListResponse(
        images=[ImageInfo(**img) for img in images],
        total=len(images)
    )


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """
    获取图片文件

    Args:
        filename: 图片文件名

    Returns:
        图片文件
    """
    image_path = settings.OUTPUT_DIR / filename
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="图片不存在")
    return FileResponse(image_path)


@app.post("/api/rename")
async def rename_image(request: dict):
    """
    重命名图片文件

    Args:
        request: 包含 old_filename 和 new_filename 的请求

    Returns:
        重命名结果
    """
    old_filename = request.get("old_filename")
    new_filename = request.get("new_filename")

    if not old_filename or not new_filename:
        raise HTTPException(status_code=400, detail="缺少文件名参数")

    # 确保 .png 扩展名
    if not new_filename.lower().endswith('.png'):
        new_filename += '.png'

    old_path = settings.OUTPUT_DIR / old_filename
    new_path = settings.OUTPUT_DIR / new_filename

    if not old_path.exists():
        return {
            "success": False,
            "error": "原文件不存在"
        }

    # 如果新文件名已存在，添加时间戳
    if new_path.exists() and new_path != old_path:
        from datetime import datetime
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        name_without_ext = new_filename.rsplit('.', 1)[0]
        new_filename = f"{name_without_ext}_{timestamp}.png"
        new_path = settings.OUTPUT_DIR / new_filename

    try:
        old_path.rename(new_path)
        return {
            "success": True,
            "filename": new_filename,
            "url": f"/api/images/{new_filename}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ===== 用户模板 API =====


@app.post("/api/templates", response_model=TemplateResponse)
async def create_template(request: CreateTemplateRequest):
    """
    创建新的用户模板

    Args:
        request: 创建模板请求

    Returns:
        创建结果
    """
    template_service = app.state.template_service
    template = template_service.create_template(request)

    return TemplateResponse(
        success=True,
        template=template
    )


@app.get("/api/templates", response_model=TemplateListResponse)
async def get_templates():
    """
    获取所有用户模板

    Returns:
        模板列表
    """
    template_service = app.state.template_service
    templates = template_service.get_templates()

    return TemplateListResponse(
        templates=templates,
        total=len(templates)
    )


@app.delete("/api/templates/{template_id}", response_model=TemplateResponse)
async def delete_template(template_id: str):
    """
    删除模板

    Args:
        template_id: 模板 ID

    Returns:
        删除结果
    """
    template_service = app.state.template_service
    success = template_service.delete_template(template_id)

    if success:
        return TemplateResponse(success=True)
    else:
        return TemplateResponse(
            success=False,
            error="模板不存在"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
