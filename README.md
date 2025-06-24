# common-gui-prompt-generator

你是 **OpenAI Codex**，擅长一次性产出可直接运行的全栈代码。\
请按以下**完整需求**生成一个「Python 3（FastAPI）+ React 18（TypeScript）」前后端分离项目，用 **Vite** 构建前端，后端用 **Uvicorn** 运行。\
代码开箱即用，目录清晰，符合现代 Web 与 a11y 最佳实践。**输出仅包含代码与必要注释，不要额外解释**。

---

## 业务场景  
用户上传（拖拽或点击选择）多张 **移动端 App 截图**，输入中文场景描述，点击按钮后经后台调用 **OpenAI 多模态模型** 生成 **GUI-Agent 工作流 DSL**，并在前端实时展示，可一键复制。  

> **GUI-Agent DSL 结构要求**  
> - **workflow** → 若干 **nodes**，每个 node 对应一个“业务动作”。  
> - 每个 node 必须包含：  
>   - `id` (字符串，序号或业务名称)  
>   - `title` (动作标题，如“打开 App”)  
>   - `prompt` (可直接喂给 GUI-Agent 的自然语言指令)  
>   - `inputs` (对象数组：name + type + desc，例如 `[{name:"question",type:"string",desc:"用户提问"}]`)  
>   - `outputs` (对象数组：name + type + desc，例如 `[{name:"screens",type:"Image[]",desc:"回复过程截图"}]`)  
> - 后端以 **JSON** 返回，前端用 `<pre>` 原样渲染。

**示例**  
```json
{
  "workflow": [
    {
      "id": "init",
      "title": "打开飞猪并进入问一问",
      "prompt": "Launch Fliggy, tap \"问一问\", start new chat if needed.",
      "inputs": [],
      "outputs": [
        {"name": "homeScreenshot","type":"Image","desc":"主页截图"}
      ]
    },
    {
      "id": "ask",
      "title": "发送问题",
      "prompt": "Input `${question}` then tap send and wait until the blue \"停止\" button disappears.",
      "inputs": [
        {"name":"question","type":"string","desc":"当前用户问题"}
      ],
      "outputs": [
        {"name":"conversationScreens","type":"Image[]","desc":"包含该问题的对话截图列表"}
      ]
    }
  ]
}
````

---

## 技术栈

* **后端**：Python 3.11、FastAPI、Pydantic、python-dotenv、OpenAI Python SDK、Uvicorn
* **前端**：React 18 + TypeScript、Vite、Tailwind CSS、shadcn/ui、lucide-react、framer-motion
* **通用**：ESLint、Prettier、pnpm

---

## OpenAI API KEY 配置

1. 在 `backend/.env` 填 `OPENAI_API_KEY=<your_key>`。
2. `python-dotenv` 自动加载，环境变量可覆盖。
3. 未检测到 Key 时启动警告，调用接口报 500。

---

## 功能明细

### 后端 (FastAPI)

* `POST /api/generateDsl`

  * `multipart/form-data`

    * `images`: List\[UploadFile] (image/\*, ≤10 张, ≤5 MB/张)
    * `description`: str
  * 在 `generate_dsl(images, description)` 中：

    1. 将所有图片 Base64，连同描述拼 Prompt。
    2. 调 `openai.chat.completions.create`（gpt-4o／vision）。
    3. 解析/规整为 **GUI-Agent Workflow JSON**（见结构要求）。
  * 返回 `{"dsl": <json_string>}`

### 前端 (React)

1. **文件上传**：拖拽/点击；高亮拖拽状态；显示已选文件数。
2. **场景描述**：shadcn `<Textarea>`，min-height 120 px。
3. **生成按钮**：点击后调用 `/api/generateDsl`；framer-motion 旋转图标指示 loading。
4. **结果面板**：深色 `<pre>`，绿色等宽字体；右上角 “📋 Copy” 按钮。
5. **布局**：≥1024 px 三列（1/3 上传 + 2/3 结果），小屏单列。
6. **类型安全**：禁止 `any`；Axios 封装 API 调用。
7. **动画**：拖拽区域 `whileDragOver` 放大；按钮 `whileTap` 缩小。

---

## 目录结构

```
project-root/
├─ backend/
│  ├─ main.py            # FastAPI + OpenAI 调用
│  ├─ requirements.txt   # fastapi uvicorn openai python-dotenv pillow
│  └─ .env.example       # OPENAI_API_KEY=sk-...
├─ frontend/
│  ├─ index.html
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  └─ components/
│  ├─ tsconfig.json
│  ├─ tailwind.config.ts
│  └─ vite.config.ts
└─ README.md
```

---

## 交付物

按下列顺序输出 **七** 个代码块，每段前写文件路径注释：

1. `python backend/requirements.txt`
2. `text backend/.env.example`
3. `python backend/main.py`
4. `tsx frontend/src/App.tsx`
5. `tsx frontend/src/main.tsx`
6. `ts frontend/tailwind.config.ts`
7. `md README.md`

> README 应包含：环境搭建、.env 配置、启动命令以及示例 curl 请求。

请严格按照以上文件与格式输出；不要添加其他说明。

```
