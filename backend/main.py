from __future__ import annotations

import base64
import io
from typing import List

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel, BaseSettings
from dotenv import load_dotenv
from PIL import Image
import magic
import aiofiles
import os

load_dotenv()

class Settings(BaseSettings):
    LLM_KEY_GEMINI: str | None = None
    LLM_KEY_OPENAI: str | None = None
    MAX_UPLOAD_MB: int = 5
    MAX_IMAGES: int = 10

settings = Settings()
app = FastAPI(title="GUI Agent DSL Generator")

class TemplateItem(BaseModel):
    id: str
    title: str
    nodes: list

TEMPLATES_PATH = os.path.join(os.path.dirname(__file__), 'templates', 'tars_routes.json')

@app.get('/api/templates')
async def get_templates():
    async with aiofiles.open(TEMPLATES_PATH, 'r') as f:
        data = await f.read()
    return JSONResponse(content=data, media_type='application/json')

async def verify_image(file: UploadFile):
    if file.content_type.split('/')[0] != 'image':
        raise HTTPException(status_code=400, detail='Invalid content type')
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail='File too large')
    mime = magic.from_buffer(content, mime=True)
    if not mime.startswith('image'):
        raise HTTPException(status_code=400, detail='Invalid file')
    return content

class DslResponse(BaseModel):
    dsl: str

async def call_llm(model: str, images_b64: List[str], description: str) -> str:
    if model == 'openai':
        if not settings.LLM_KEY_OPENAI:
            raise HTTPException(status_code=502, detail='OpenAI key missing')
        import openai
        client = openai.OpenAI(api_key=settings.LLM_KEY_OPENAI)
        content = [
            {"type": "text", "text": description}
        ] + [
            {"type": "image_url", "image_url": f"data:image/png;base64,{img}"}
            for img in images_b64
        ]
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": content}],
            response_format={"type": "json_object"},
        )
        return completion.choices[0].message.content
    elif model == 'gemini':
        if not settings.LLM_KEY_GEMINI:
            raise HTTPException(status_code=502, detail='Gemini key missing')
        from google.generativeai import GenerativeModel, configure
        configure(api_key=settings.LLM_KEY_GEMINI)
        gm = GenerativeModel('gemini-1.5-flash-latest')
        parts = [description] + [
            {
                'mime_type': 'image/png',
                'data': base64.b64decode(img)
            } for img in images_b64
        ]
        resp = gm.generate_content(parts, generation_config={'response_mime_type': 'application/json'})
        return resp.text
    else:
        raise HTTPException(status_code=400, detail='Invalid model')

@app.post('/api/generateDsl', response_model=DslResponse)
async def generate_dsl(
    model: str = Query('gemini', regex='^(gemini|openai)$'),
    images: List[UploadFile] = File(...),
    description: str = File(...)
):
    if len(images) > settings.MAX_IMAGES:
        raise HTTPException(status_code=400, detail='Too many files')
    contents = [await verify_image(file) for file in images]
    images_b64 = [base64.b64encode(c).decode('utf-8') for c in contents]
    dsl = await call_llm(model, images_b64, description)
    return {"dsl": dsl}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
