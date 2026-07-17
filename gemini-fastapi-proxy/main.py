import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

# Load .env file if it exists
load_dotenv(Path(__file__).parent / ".env")

GOOGLE_LLM_API_KEY = os.getenv("GOOGLE_LLM_API_KEY")
GOOGLE_LLM_MODEL = os.getenv("GOOGLE_LLM_MODEL", "gemini-3.1-flash-lite")
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app = FastAPI(title="Gemini API Secure Proxy")

# Enable CORS to protect your backend from unauthorized domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Health check endpoint to verify the server is running."""
    return {"status": "ok", "model_configured": GOOGLE_LLM_MODEL}


@app.post("/api/gemini")
async def gemini_proxy(request: Request) -> Any:
    """
    Unified proxy endpoint for Gemini API.
    Supports both:
    1. Simple prompt payload: {"prompt": "...", "generationConfig": {...}} -> returns {"text": "..."}
    2. Raw Gemini payload: {"contents": [...], "systemInstruction": {...}} -> returns raw Gemini JSON response
    """
    if not GOOGLE_LLM_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_LLM_API_KEY is not configured on the proxy server.",
        )

    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GOOGLE_LLM_MODEL}:generateContent?key={GOOGLE_LLM_API_KEY}"
    )

    # Mode 1: Simple Prompt Payload (used by shinndann.html)
    if "prompt" in body and "contents" not in body:
        prompt = body.get("prompt")
        gen_config = body.get("generationConfig")

        request_body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": gen_config or {
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
        try:
            text = data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError):
            text = ""
        return {"text": text}

    # Mode 2: Raw Gemini Payload (used by ai.html)
    else:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(url, json=body)
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

        return response.json()
