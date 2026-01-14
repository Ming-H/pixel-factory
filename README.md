# Pixel Factory

> 基于 Gemini 3 Pro Image Preview 的 AI 图像生成工厂

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/Ming-H/pixel-factory)
[![Python](https://img.shields.io/badge/python-3.10+-green)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-teal)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

Pixel Factory 是一个功能完善的 Web 应用，通过简单的提示词即可批量生成高质量的 AI 图片。支持多种尺寸、风格选择、参考图片上传和历史记录管理。

## ✨ 功能特性

### 核心功能
- **单张生成** - 输入提示词快速生成单张图片
- **批量生成** - 一次性生成多张图片，最多支持 10 张
- **多种尺寸** - 支持 1:1、16:9、9:16、4:3、3:4 等多种宽高比
- **实时预览** - 生成后直接在浏览器中预览
- **历史记录** - 查看和管理所有已生成的图片

### 高级功能
- **风格选择** - 30+ 种专业风格预设（摄影、艺术、动漫、数字艺术、设计、光线）
- **快速模板** - 一键应用精选提示词模板
- **参考图片** - 上传参考图片让 AI 学习风格和形象
- **文件命名** - 生成后自定义文件名，或使用默认的日期时间命名
- **进度显示** - 精美的生成进度条，实时反馈生成状态

### 技术特性
- **现代化界面** - 左侧边栏 + 右侧工作区布局
- **响应式设计** - 适配桌面和移动设备
- **异步处理** - 高性能的异步架构
- **RESTful API** - 完整的 API 支持，易于集成

## 🚀 快速开始

### 环境要求

- Python 3.10 或更高版本
- pip 包管理器

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/Ming-H/pixel-factory.git
   cd pixel-factory
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **配置 API Key**

   复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

   编辑 `.env` 文件，填入您的 Gemini API Key：
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

   获取 API Key：
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

## 📖 使用方法

### Web 界面

#### 单张生成

1. 在左侧选择「快速模板」或直接输入提示词
2. 可选：点击「风格选择」选择预设风格
3. 可选：上传参考图片
4. 选择宽高比
5. 点击左侧底部的「生成图片」按钮
6. 等待进度条完成，为图片命名

#### 批量生成

1. 切换到「批量生成」标签
2. 每行输入一个提示词（最多 10 个）
3. 点击「批量生成」

#### 历史记录

1. 切换到「历史记录」标签
2. 查看所有已生成的图片
3. 点击图片可在灯箱中查看大图

### 风格选择

Pixel Factory 提供了 30+ 种专业风格：

- **摄影风格**：人像、风景、微距、街头、商业
- **艺术风格**：油画、水彩、素描、印象派、超现实主义
- **动漫风格**：日系动漫、Q版、吉卜力、赛博动漫、少女漫画
- **数字艺术**：3D 渲染、像素艺术、矢量插画、概念艺术、故障艺术
- **设计风格**：极简主义、赛博朋克、蒸汽波、包豪斯、装饰艺术
- **光线氛围**：黄金时刻、蓝色时刻、霓虹灯光、电影光效、自然光线

### API 使用

#### 生成单张图片

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "一只可爱的橘猫在阳光下打盹",
    "aspect_ratio": "1:1"
  }'
```

#### 批量生成图片

```bash
curl -X POST http://localhost:8000/api/generate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "prompts": ["可爱的金毛犬", "雨后的森林", "海边日落"],
    "aspect_ratio": "16:9"
  }'
```

#### 使用参考图片

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "类似的风格",
    "aspect_ratio": "1:1",
    "reference_image": "data:image/png;base64,iVBORw0KG..."
  }'
```

更多 API 详情请访问 http://localhost:8000/docs

## 📁 项目结构

```
pixel-factory/
├── .env                    # 环境变量配置（不提交到 Git）
├── .env.example           # 环境变量模板
├── .gitignore             # Git 忽略文件
├── requirements.txt       # Python 依赖
├── main.py               # FastAPI 应用入口
├── config.py             # 配置管理
├── generators/
│   ├── __init__.py
│   └── gemini.py         # Gemini 图片生成器
├── models/
│   ├── __init__.py
│   └── schemas.py        # API 数据模型
├── static/
│   ├── css/
│   │   └── style.css     # 样式文件
│   └── js/
│       ├── app.js        # 前端交互逻辑
│       └── styles.js     # 风格配置
├── templates/
│   └── index.html        # Web 界面
├── generated_images/     # 图片输出目录
├── README.md             # 项目文档
├── LICENSE               # MIT 许可证
└── API.md               # API 详细文档
```

## ⚙️ 配置说明

在 `config.py` 中可以修改以下配置：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `HOST` | 0.0.0.0 | 服务器监听地址 |
| `PORT` | 8000 | 服务器端口 |
| `GEMINI_MODEL` | gemini-3-pro-image-preview | Gemini 模型名称 |
| `ASPECT_RATIOS` | ["1:1", "16:9", "9:16", ...] | 支持的宽高比列表 |
| `OUTPUT_DIR` | generated_images | 图片输出目录 |

## 🎨 界面预览

### 主要界面
- 左侧边栏：导航、快速模板、宽高比选择、生成按钮
- 右侧工作区：风格选择、提示词输入、参考图片上传、结果展示

### 交互特性
- 渐变色背景装饰
- 玻璃态毛玻璃效果
- 平滑的动画过渡
- 实时进度反馈
- 响应式布局

## ❓ 常见问题

### Q: 生成失败怎么办？

A: 请检查：
1. API Key 是否正确配置
2. 网络连接是否正常
3. 是否超出 API 配额限制
4. 提示词是否符合内容政策

### Q: 可以修改输出目录吗？

A: 可以，在 `config.py` 中修改 `OUTPUT_DIR` 配置。

### Q: 如何部署到生产环境？

A: 建议使用以下命令：
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

或使用 Docker（需自行编写 Dockerfile）。

### Q: 支持哪些图片格式？

A: 目前仅支持 PNG 格式输出。

### Q: 生成的图片保存在哪里？

A: 默认保存在项目的 `generated_images/` 目录下，文件名格式为 `YYYY-MM-DD_HHMMSS.png`。

## 🛠️ 技术栈

- **后端框架**: FastAPI
- **图片生成**: Google Gemini 3 Pro Image Preview
- **模板引擎**: Jinja2
- **样式**: 原生 CSS（CSS Variables + Flexbox）
- **前端交互**: 原生 JavaScript（ES6+）

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 🙏 致谢

- [Google Gemini](https://ai.google.dev/) - 强大的 AI 图片生成能力
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [Google Gen AI SDK](https://github.com/googleapis/python-genai) - Python SDK for Gemini API

---

**Made with ❤️ by [Ming-H](https://github.com/Ming-H)**
