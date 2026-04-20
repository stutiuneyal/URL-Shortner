from fastapi import APIRouter, HTTPException

from models import ChatRequest, ChatResponse
from services.chat_generator import generate_chat_response

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
async def generate_analytics_chat(request: ChatRequest):
    try:
        result = await generate_chat_response(request)
        return ChatResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate AI chat response"
        ) from exc