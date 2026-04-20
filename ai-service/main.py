from fastapi import FastAPI
from routes.slug import router as slug_router
from routes.insights import router as insights_router
from routes.chat import router as chat_router
from settings import settings

app = FastAPI(title=settings.APP_NAME)

app.include_router(slug_router)
app.include_router(insights_router)
app.include_router(chat_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "environment": settings.APP_ENV,
        "openaiConfigured": bool(settings.OPENAI_API_KEY),
        "model": settings.OPENAI_MODEL
    }