import re
from typing import List

from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from settings import settings


class SlugSuggestionItemSchema(BaseModel):
    slug: str = Field(description="URL-safe slug, 4 to 32 chars, lowercase, letters numbers hyphens only")
    reason: str = Field(description="Why this slug is a good option")
    style: str = Field(description="One of: seo, brandable, technical, clean")


class SlugSuggestionSet(BaseModel):
    suggestions: List[SlugSuggestionItemSchema]


def normalize_slug(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    value = re.sub(r"-{2,}", "-", value).strip("-")
    return value[:32]


def get_model():
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set")

    return ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0.4
    )


async def generate_slug_suggestions(target: str, title: str, description: str, brand_hint: str | None):
    structured_model = get_model().with_structured_output(
        SlugSuggestionSet,
        method="json_schema"
    )

    prompt = f"""
You are generating short-link slug suggestions for a production URL shortener.

Rules:
- Return exactly 5 suggestions.
- Each slug must be lowercase.
- Use only letters, numbers, and hyphens.
- Length must be between 4 and 32 characters.
- Avoid generic junk like link-123, click-here, page-url.
- Prefer memorable, clean, brand-friendly, or SEO-friendly slugs.
- Base suggestions on the target URL plus page metadata.
- If relevant, include brand hint carefully but not in every suggestion.

Target URL: {target}
Page title: {title}
Page description: {description}
Brand hint: {brand_hint or ""}
"""

    result = await structured_model.ainvoke(prompt)

    cleaned = []
    seen = set()

    for item in result.suggestions:
        slug = normalize_slug(item.slug)
        if not slug or len(slug) < 4:
            continue
        if slug in seen:
            continue

        seen.add(slug)
        cleaned.append({
            "slug": slug,
            "reason": item.reason,
            "style": item.style if item.style in {"seo", "brandable", "technical", "clean"} else "clean"
        })

    return cleaned[:5]