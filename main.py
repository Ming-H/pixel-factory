"""Pixel Factory - 图像产出工厂"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

from config import settings
from generators.gemini import GeminiImageGenerator
from models.schemas import (
    GenerateRequest,
    GenerateResponse,
    BatchGenerateRequest,
    BatchGenerateResponse,
    ImagesListResponse,
    ImageInfo,
    HealthResponse
)


# 全局生成器实例
generator: GeminiImageGenerator | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global generator
    # 启动时初始化
    generator = GeminiImageGenerator()
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
        aspect_ratio=request.aspect_ratio
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
