import os
import base64
import json
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import aiofiles
import magic

load_dotenv()

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
MAX_IMAGES = int(os.getenv("MAX_IMAGES", "10"))
LLM_KEY_GEMINI = os.getenv("LLM_KEY_GEMINI")
LLM_KEY_OPENAI = os.getenv("LLM_KEY_OPENAI")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class DSLResponse(BaseModel):
    dsl: dict


def validate_file(file: UploadFile):
    if not file.content_type.startswith("image"):
        raise HTTPException(status_code=400, detail="Invalid MIME type")
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")
    header = file.file.read(2048)
    file.file.seek(0)
    mime = magic.from_buffer(header, mime=True)
    if not mime.startswith("image"):
        raise HTTPException(status_code=400, detail="Invalid file type")


async def file_to_base64(f: UploadFile) -> str:
    data = await f.read()
    await f.seek(0)
    return base64.b64encode(data).decode()


def parse_json(text: str) -> dict:
    try:
        return json.loads(text)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to parse model output")


@app.post("/api/generateDsl", response_model=DSLResponse)
async def generate_dsl(
    description: str = Form(...),
    images: List[UploadFile] = File(...),
    model: str = "gemini",
):
    if len(images) > MAX_IMAGES:
        raise HTTPException(status_code=400, detail="Too many images")
    if model not in {"gemini", "openai"}:
        raise HTTPException(status_code=400, detail="Invalid model")
    if model == "gemini" and not LLM_KEY_GEMINI:
        raise HTTPException(status_code=502, detail="Gemini key missing")
    if model == "openai" and not LLM_KEY_OPENAI:
        raise HTTPException(status_code=502, detail="OpenAI key missing")

    for f in images:
        validate_file(f)

    b64_list = [await file_to_base64(f) for f in images]

    prompt = description

    content = ""  # LLM raw response
    if model == "openai":
        import openai

        openai.api_key = LLM_KEY_OPENAI
        msgs = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": description}
                ]
                + [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{b}"},
                    }
                    for b in b64_list
                ],
            }
        ]
        resp = await openai.ChatCompletion.acreate(model="gpt-4o", messages=msgs)
        content = resp.choices[0].message.content
    else:
        import base64 as _b64
        import google.generativeai as genai

        genai.configure(api_key=LLM_KEY_GEMINI)
        model_g = genai.GenerativeModel("gemini-1.5-flash")
        parts = [genai.types.text.TextPart(prompt)] + [
            genai.types.image_types.Image.from_bytes(_b64.b64decode(b), mime_type="image/png")
            for b in b64_list
        ]
        resp = await model_g.generate_content_async(parts)
        content = resp.text

    dsl = parse_json(content)
    return {"dsl": dsl}


@app.get("/api/templates")
async def get_templates():
    async with aiofiles.open("backend/templates/tars_routes.json", "r", encoding="utf-8") as f:
        data = await f.read()
    return JSONResponse(content=json.loads(data))
