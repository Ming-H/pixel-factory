# Pixel Factory

> 基于 Gemini 3 Pro Image Preview 的图像产出工厂

Pixel Factory 是一个功能完善的 Web 应用，通过简单的提示词即可批量生成高质量的 AI 图片。支持多种尺寸、批量处理和历史记录管理。

![Pixel Factory](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.10+-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)

## 功能特性

- **单张生成** - 输入提示词快速生成单张图片
- **批量生成** - 一次性生成多张图片，提高效率
- **多种尺寸** - 支持 1:1、16:9、9:16、4:3、3:4、21:9、9:21 等多种宽高比
- **实时预览** - 生成后直接在浏览器中预览
- **历史记录** - 查看和管理所有已生成的图片
- **Web 界面** - 简洁美观的用户界面
- **RESTful API** - 完整的 API 支持，易于集成
- **异步处理** - 高性能的异步架构

## 快速开始

### 环境要求

- Python 3.10 或更高版本
- pip 包管理器

### 安装

1. **克隆或下载项目**
   ```bash
   cd pixel-factory
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **配置 API Key**

   编辑 `.env` 文件，填入您的 Gemini API Key：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   获取 API Key 的步骤：
   - 访问 [Google AI Studio](https://aistudio.google.com/apikey)
   - 登录 Google 账号
   - 创建新的 API Key
   - 复制并粘贴到 `.env` 文件中

4. **启动服务**
   ```bash
   python main.py
   ```

5. **访问应用**

   打开浏览器访问：http://localhost:8000

## 使用方法

### Web 界面

#### 单张生成

1. 选择「单张生成」标签
2. 输入提示词（例如："一只可爱的橘猫在阳光下打盹"）
3. 选择宽高比
4. 点击「生成图片」

#### 批量生成

1. 选择「批量生成」标签
2. 每行输入一个提示词
3. 选择宽高比
4. 点击「批量生成」

#### 历史记录

1. 选择「历史记录」标签
2. 查看所有已生成的图片
3. 点击图片可在新标签页中打开
4. 点击「刷新」更新列表

### API 使用

#### 生成单张图片

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a beautiful sunset over the ocean",
    "aspect_ratio": "16:9"
  }'
```

#### 批量生成图片

```bash
curl -X POST http://localhost:8000/api/generate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": ["a cat", "a dog", "a bird"],
    "aspect_ratio": "1:1"
  }'
```

更多 API 详情请查看 [API.md](API.md) 或访问 http://localhost:8000/docs

## 项目结构

```
pixel-factory/
├── .env                    # 环境变量配置
├── .gitignore             # Git 忽略文件
├── requirements.txt       # Python 依赖
├── main.py               # FastAPI 应用入口
├── config.py             # 配置管理
├── generators/
│   ├── __init__.py
│   └── gemini.py         # 图片生成器
├── models/
│   ├── __init__.py
│   └── schemas.py        # API 数据模型
├── static/
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       └── app.js        # 前端交互逻辑
├── templates/
│   └── index.html        # Web 界面
├── generated_images/     # 图片输出目录
├── README.md             # 项目文档
└── API.md               # API 详细文档
```

## 配置说明

在 `config.py` 中可以修改以下配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `HOST` | 0.0.0.0 | 服务器监听地址 |
| `PORT` | 8000 | 服务器端口 |
| `GEMINI_MODEL` | gemini-3-pro-image-preview | Gemini 模型名称 |
| `ASPECT_RATIOS` | ["1:1", "16:9", "9:16", ...] | 支持的宽高比列表 |

## 常见问题

### Q: 生成失败怎么办？

A: 请检查：
1. API Key 是否正确配置
2. 网络连接是否正常
3. 是否超出 API 配额限制

### Q: 可以修改输出目录吗？

A: 可以，在 `config.py` 中修改 `OUTPUT_DIR` 配置。

### Q: 如何部署到生产环境？

A: 建议使用以下命令：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Q: 支持哪些图片格式？

A: 目前仅支持 PNG 格式输出。

## 技术栈

- **后端框架**: FastAPI
- **图片生成**: Google Gemini 3 Pro Image Preview
- **模板引擎**: Jinja2
- **样式**: 原生 CSS
- **前端交互**: 原生 JavaScript

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Google Gemini](https://ai.google.dev/) - 强大的 AI 图片生成能力
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
