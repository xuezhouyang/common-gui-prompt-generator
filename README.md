# GUI Agent Workflow Generator

## 环境搭建

```bash
# 安装后端依赖
python3 -m venv venv && . venv/bin/activate
pip install -r backend/requirements.txt

# 安装前端依赖
cd frontend && pnpm install
```

### .env 配置

复制 `backend/.env.example` 到 `backend/.env` 并填入实际的 API Key：

```
LLM_KEY_GEMINI=your-gemini-key
LLM_KEY_OPENAI=your-openai-key
MAX_UPLOAD_MB=5
MAX_IMAGES=10
```

## 启动

```bash
# 后端
uvicorn backend.main:app --reload

# 前端
pnpm dev
```

访问 `http://localhost:5173` 使用。

### 模型切换

前端右上角下拉可随时切换 Gemini 或 OpenAI，选择后持久化到 `localStorage`。后端接口 `/api/generateDsl?model=<gemini|openai>` 会根据传入的模型调用不同的 LLM。

### 示例 curl

```bash
curl -F "images=@test.png" -F "description=测试" \
  "http://localhost:8000/api/generateDsl?model=gemini"
```

### 常见问题

1. **502 错误**：缺失对应模型的 API Key。
2. **400 错误**：上传文件类型或大小不合规。
3. **依赖问题**：确保安装 `python-magic` 所需系统库，如 `libmagic`。
