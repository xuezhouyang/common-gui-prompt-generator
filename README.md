# GUI Agent DSL Generator

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
Edit `.env` with your keys:

```
LLM_KEY_GEMINI=gemini-key-xxxxxxxx
LLM_KEY_OPENAI=openai-key-xxxxxxxx
MAX_UPLOAD_MB=5
MAX_IMAGES=10
```

### Frontend

```bash
cd frontend
pnpm install
```

## Running

### Start Backend

```bash
uvicorn backend.main:app --reload
```

### Start Frontend

```bash
pnpm dev --filter frontend
```

Open http://localhost:5173

### Switch Model

Use dropdown to select Gemini or OpenAI. Missing key returns 502.

### Example Curl

```bash
curl -F "images=@test.png" -F "description=测试" "http://localhost:8000/api/generateDsl?model=gemini"
```

### Troubleshooting

- 502: check API keys in `.env`.
- 400: invalid file type/size.
