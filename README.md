# GUI-Agent DSL Generator

## 安装依赖

```bash
# 后端
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 前端
cd ../frontend
pnpm install
```

## 环境配置

复制 `.env.example` 为 `.env` 并填写相应的 LLM Key。也可通过环境变量传入。

```env
LLM_KEY_GEMINI=gemini-key-xxxxxxxx
LLM_KEY_OPENAI=openai-key-xxxxxxxx
MAX_UPLOAD_MB=5
MAX_IMAGES=10
```

## 启动

```bash
# 后端
cd backend
uvicorn main:app --reload --port 8000

# 前端
cd ../frontend
pnpm dev
```

前端通过 `localStorage` 记住模型选择，可在界面右上角下拉切换 `Gemini` 或 `OpenAI`。
缺少对应的 Key 时，后端返回 502。

## 本地示例

```bash
curl -F "images=@/path/to/img.png" -F "description=测试" \
  "http://localhost:8000/api/generateDsl?model=gemini"
```

## 常见问题

- **Key 缺失/错误**：检查 `.env` 或环境变量是否正确；确保选择的模型有对应的 Key。
- **上传失败 400**：确认图片数量、大小、格式均在限制内。
- **依赖安装问题**：建议使用最新的 `pnpm` 与 Python 3.11。
