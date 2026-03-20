from fastapi import FastAPI
from app.api import chat
from fastapi.middleware.cors import CORSMiddleware
import requests
from app.config import settings
from app.core.memory import check_redis

app = FastAPI(title="AppleShop Virtual Assistant", version="1.0.0")

# Cấu hình CORS cho Frontend (React/Vue) gọi vào
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/ai", tags=["Chat"])

@app.on_event("startup")
async def startup():
    await check_redis()

    # Warm-up AI model without blocking service startup when AI endpoint is unavailable.
    try:
        r = requests.post(
            settings.OLLAMA_URL,
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": "Xin chào",
                "stream": False,
                "keep_alive": -1,
            },
            timeout=8,
        )
        if r.status_code >= 400:
            print(f"⚠️ AI warm-up failed with status {r.status_code}: {r.text}")
    except Exception as exc:
        print(f"⚠️ AI warm-up skipped: {exc}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)