from fastapi import APIRouter, HTTPException
from models import InsightRequest, InsightResponse
from services.insight_generator import generate_insights

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/insights", response_model=InsightResponse)
async def generate_link_insights(request: InsightRequest):
    try:
        result = await generate_insights(request)
        return InsightResponse(**result)
    except ValueError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Failed to generate AI insights"
        ) from exc