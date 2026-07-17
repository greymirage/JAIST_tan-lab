import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv(Path(__file__).with_name(".env"))

GOOGLE_LLM_API_KEY = os.getenv("GOOGLE_LLM_API_KEY")
GOOGLE_LLM_MODEL = os.getenv("GOOGLE_LLM_MODEL", "gemini-2.0-flash")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)


class GeminiProxyRequest(BaseModel):
    prompt: str
    generationConfig: dict[str, Any] | None = None


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/gemini")
async def gemini_proxy(payload: GeminiProxyRequest) -> dict[str, str]:
    if not GOOGLE_LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_LLM_API_KEY is not configured.",
        )

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GOOGLE_LLM_MODEL}:generateContent?key={GOOGLE_LLM_API_KEY}"
    )
    request_body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": payload.prompt}],
            }
        ],
        "generationConfig": payload.generationConfig
        or {
            "temperature": 0.8,
            "maxOutputTokens": 320,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(url, json=request_body)
    except httpx.HTTPError as error:
        raise HTTPException(
            status_code=502,
            detail=f"Could not reach Gemini API: {error.__class__.__name__}",
        ) from error

    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini request failed: {response.status_code} {response.text[:300]}",
        )

    data = response.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get(
        "text", ""
    )

    return {"text": text}
