from fastapi import FastAPI
from routes.slug import router as slug_router

app = FastAPI(title="URL Shortener AI Service")

app.include_router(slug_router)