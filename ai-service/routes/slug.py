from fastapi import APIRouter
from models import SlugSuggestionRequest, SlugSuggestionResponse
from services.metadata import fetch_page_metadata
from services.slug_generator import generate_slug_suggestions

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/slug-suggestions", response_model=SlugSuggestionResponse)
async def suggest_slugs(request: SlugSuggestionRequest):
    metadata = await fetch_page_metadata(str(request.target))

    suggestions = await generate_slug_suggestions(
        target=str(request.target),
        title=metadata.get("title", ""),
        description=metadata.get("description", ""),
        brand_hint=request.brand_hint
    )

    return SlugSuggestionResponse(suggestions=suggestions)