import os
import io
import json
import imghdr
import magic
from typing import List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image
import aiofiles

load_dotenv()

MAX_MB = int(os.getenv("MAX_UPLOAD_MB", "5"))
MAX_IMAGES = int(os.getenv("MAX_IMAGES", "10"))
GEMINI_KEY = os.getenv("LLM_KEY_GEMINI")
OPENAI_KEY = os.getenv("LLM_KEY_OPENAI")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Node(BaseModel):
    id: str
    title: str
    prompt: str
    inputs: list
    outputs: list

class Workflow(BaseModel):
    workflow: List[Node]

@app.post("/api/generateDsl")
async def generate_dsl(description: str = Form(...), images: List[UploadFile] = File(...), model: str = "gemini"):
    if len(images) > MAX_IMAGES:
        raise HTTPException(status_code=400, detail="Too many images")

    for img in images:
        if img.content_type.split("/")[0] != "image":
            raise HTTPException(status_code=400, detail="Invalid file type")
        contents = await img.read()
        if len(contents) > MAX_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")
        if not imghdr.what(None, h=contents):
            raise HTTPException(status_code=400, detail="Invalid image")
        mime = magic.from_buffer(contents, mime=True)
        if not mime.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid mime")

    if model == "gemini":
        if not GEMINI_KEY:
            raise HTTPException(status_code=502, detail="Gemini key missing")
        try:
            import google.generativeai as genai
            genai.configure(api_key=GEMINI_KEY)
            gemini = genai.GenerativeModel("gemini-pro-vision")
            img_parts = [genai.Image.from_bytes(await img.read()) for img in images]
            prompt = description
            response = gemini.generate_content([prompt] + img_parts)
            text = response.text
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not OPENAI_KEY:
            raise HTTPException(status_code=502, detail="OpenAI key missing")
        try:
            import openai
            client = openai.OpenAI(api_key=OPENAI_KEY)
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": description,
                },
            ]
            response = client.chat.completions.create(model="gpt-4o", messages=messages)
            text = response.choices[0].message.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        data = json.loads(text)
        Workflow(**data)  # validate
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Invalid DSL: {e}")
    return JSONResponse(data)

@app.get("/api/templates")
async def get_templates():
    async with aiofiles.open("backend/templates/tars_routes.json", "r") as f:
        content = await f.read()
    return JSONResponse(json.loads(content))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
