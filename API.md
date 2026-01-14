# Pixel Factory API 文档

本文档详细描述了 Pixel Factory 的所有 API 端点。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## API 端点

### 1. 健康检查

检查服务运行状态。

**请求**
```
GET /health
```

**响应**
```json
{
  "status": "ok",
  "app_name": "Pixel Factory",
  "version": "1.0.0"
}
```

---

### 2. 生成单张图片

根据提示词生成单张图片。

**请求**
```
POST /api/generate
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompt | string | 是 | 图片生成提示词 |
| aspect_ratio | string | 否 | 宽高比，默认 "1:1" |

**请求示例**
```json
{
  "prompt": "a beautiful sunset over the ocean",
  "aspect_ratio": "16:9"
}
```

**支持的宽高比**
- `1:1` - 正方形
- `16:9` - 横向宽屏
- `9:16` - 纵向竖屏
- `4:3` - 传统横向
- `3:4` - 传统纵向
- `21:9` - 超宽屏
- `9:21` - 超竖屏

**响应示例**

成功：
```json
{
  "success": true,
  "filename": "image_1.png",
  "path": "/path/to/generated_images/image_1.png",
  "url": "/api/images/image_1.png",
  "prompt": "a beautiful sunset over the ocean"
}
```

失败：
```json
{
  "success": false,
  "error": "生成失败的具体原因",
  "prompt": "原始提示词"
}
```

**cURL 示例**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a cute orange cat sleeping in sunlight",
    "aspect_ratio": "1:1"
  }'
```

---

### 3. 批量生成图片

根据多个提示词批量生成图片。

**请求**
```
POST /api/generate/batch
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| prompts | array[string] | 是 | 图片生成提示词列表 |
| aspect_ratio | string | 否 | 宽高比，默认 "1:1" |

**请求示例**
```json
{
  "prompts": [
    "a fluffy cat",
    "a playful dog",
    "a colorful bird"
  ],
  "aspect_ratio": "1:1"
}
```

**响应示例**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "filename": "image_1.png",
      "path": "/path/to/image_1.png",
      "url": "/api/images/image_1.png",
      "prompt": "a fluffy cat"
    },
    {
      "success": true,
      "filename": "image_2.png",
      "path": "/path/to/image_2.png",
      "url": "/api/images/image_2.png",
      "prompt": "a playful dog"
    },
    {
      "success": false,
      "error": "生成失败原因",
      "prompt": "a colorful bird"
    }
  ],
  "total": 3,
  "succeeded": 2,
  "failed": 1
}
```

**cURL 示例**
```bash
curl -X POST http://localhost:8000/api/generate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": ["mountain landscape", "city skyline", "forest path"],
    "aspect_ratio": "16:9"
  }'
```

---

### 4. 获取图片列表

获取所有已生成的图片列表。

**请求**
```
GET /api/images
```

**响应示例**
```json
{
  "images": [
    {
      "filename": "image_1.png",
      "url": "/api/images/image_1.png",
      "created_at": 1234567890.123
    },
    {
      "filename": "image_2.png",
      "url": "/api/images/image_2.png",
      "created_at": 1234567891.456
    }
  ],
  "total": 2
}
```

**cURL 示例**
```bash
curl http://localhost:8000/api/images
```

---

### 5. 获取图片文件

获取指定的图片文件。

**请求**
```
GET /api/images/{filename}
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 是 | 图片文件名 |

**响应**
- 成功：返回图片文件（PNG 格式）
- 失败：404 Not Found

**cURL 示例**
```bash
# 查看图片
curl http://localhost:8000/api/images/image_1.png

# 下载图片
curl -O http://localhost:8000/api/images/image_1.png
```

---

### 6. Web 界面

返回 Web 界面的 HTML 页面。

**请求**
```
GET /
```

**响应**
返回 HTML 页面

---

### 7. API 文档

FastAPI 自动生成的交互式 API 文档。

**Swagger UI**
```
GET /docs
```

**ReDoc**
```
GET /redoc
```

---

## 错误码

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 503 | 服务不可用（生成器未初始化） |

## 错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

---

## Python SDK 示例

```python
import requests

BASE_URL = "http://localhost:8000"

# 生成单张图片
response = requests.post(f"{BASE_URL}/api/generate", json={
    "prompt": "a serene mountain landscape at dawn",
    "aspect_ratio": "16:9"
})
result = response.json()
print(result)

# 批量生成
response = requests.post(f"{BASE_URL}/api/generate/batch", json={
    "prompts": ["sunset", "sunrise", "noon"],
    "aspect_ratio": "1:1"
})
results = response.json()
print(results)

# 获取图片列表
response = requests.get(f"{BASE_URL}/api/images")
images = response.json()
print(images)
```

---

## JavaScript SDK 示例

```javascript
const BASE_URL = 'http://localhost:8000';

// 生成单张图片
async function generateImage(prompt, aspectRatio = '1:1') {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      aspect_ratio: aspectRatio
    })
  });
  return await response.json();
}

// 批量生成
async function generateBatch(prompts, aspectRatio = '1:1') {
  const response = await fetch(`${BASE_URL}/api/generate/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompts: prompts,
      aspect_ratio: aspectRatio
    })
  });
  return await response.json();
}

// 使用示例
generateImage('a beautiful garden', '16:9').then(console.log);
generateBatch(['cat', 'dog', 'bird'], '1:1').then(console.log);
```

---

## 速率限制

当前版本没有速率限制，但请注意：
- Gemini API 可能有自己的配额限制
- 建议控制批量请求的数量，避免超时

---

## 更新日志

### v1.0.0 (2024)
- 初始版本发布
- 支持单张和批量图片生成
- 支持多种宽高比
- Web 界面和 RESTful API
