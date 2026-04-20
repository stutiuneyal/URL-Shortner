from datetime import datetime, timezone
from typing import Any

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from models import InsightRequest
from settings import settings


class InsightItemSchema(BaseModel):
    title: str = Field(description="Short insight title")
    description: str = Field(description="Concise, actionable explanation")
    priority: str = Field(description="high, medium, or low")
    category: str = Field(
        description="One of: traffic, geo, device, browser, referral, anomaly, timing, action"
    )


class InsightResponseSchema(BaseModel):
    summary: str = Field(description="Executive summary of link performance")
    insights: list[InsightItemSchema] = Field(
        description="3 to 6 insights grounded only in the provided data"
    )


def _safe_model() -> ChatOpenAI:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set")

    return ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0.2
    ).with_structured_output(InsightResponseSchema, method="json_schema")


def _build_prompt(payload: InsightRequest) -> str:
    link = payload.link
    analytics = payload.analytics

    return f"""
You are an analytics intelligence assistant for a premium URL shortener platform.

Your task is to analyze structured link performance data and generate concise, actionable insights.

Rules:
- Use only the provided data.
- Do not invent facts.
- If the data is insufficient for a conclusion, avoid making that conclusion.
- Prefer useful product-style observations over generic marketing advice.
- Keep the summary crisp and executive-friendly.
- Each insight must be grounded in the data and written in plain product language.
- Highlight anomalies only if the data supports them.
- Focus on:
  - traffic trends
  - geography
  - devices
  - browsers
  - referrers
  - timing
  - anomalies
  - actionable next steps
- Return 3 to 6 insights.
- Use only these categories:
  traffic, geo, device, browser, referral, anomaly, timing, action
- Use only these priorities:
  high, medium, low

Link:
{{
  "id": "{link.id}",
  "workspaceId": "{link.workspaceId}",
  "slug": {repr(link.slug)},
  "target": {repr(link.target)},
  "createdAt": {repr(link.createdAt)},
  "clicks": {link.clicks},
  "active": {link.active},
  "expiresAt": {repr(link.expiresAt)}
}}

Analytics:
{{
  "timeline": {analytics.timeline},
  "countries": {analytics.countries},
  "devices": {analytics.devices},
  "browsers": {analytics.browsers},
  "referrers": {analytics.referrers},
  "recentClicks": {analytics.recentClicks}
}}
""".strip()


def _normalize_priority(value: str) -> str:
    value = (value or "").strip().lower()
    if value in {"high", "medium", "low"}:
        return value
    return "medium"


def _normalize_category(value: str) -> str:
    value = (value or "").strip().lower()
    allowed = {
        "traffic",
        "geo",
        "device",
        "browser",
        "referral",
        "anomaly",
        "timing",
        "action"
    }
    if value in allowed:
        return value
    return "action"


async def generate_insights(payload: InsightRequest) -> dict[str, Any]:
    model = _safe_model()
    prompt = _build_prompt(payload)
    result = await model.ainvoke(prompt)

    cleaned_insights = []
    seen_pairs = set()

    for item in result.insights:
        title = (item.title or "").strip()
        description = (item.description or "").strip()
        priority = _normalize_priority(item.priority)
        category = _normalize_category(item.category)

        if not title or not description:
            continue

        dedupe_key = (title.lower(), description.lower())
        if dedupe_key in seen_pairs:
            continue
        seen_pairs.add(dedupe_key)

        cleaned_insights.append({
            "title": title[:120],
            "description": description[:500],
            "priority": priority,
            "category": category
        })

    if len(cleaned_insights) < 3:
        cleaned_insights = [
            {
                "title": "Traffic overview available",
                "description": "This link has analytics data available, but the current pattern is not strong enough yet for deeper conclusions.",
                "priority": "medium",
                "category": "traffic"
            },
            {
                "title": "More clicks will improve signal quality",
                "description": "As more traffic accumulates, AI insights will become more specific across geography, device mix, and referrer patterns.",
                "priority": "medium",
                "category": "action"
            },
            {
                "title": "Review audience distribution",
                "description": "Use the geography, device, and referrer breakdowns to confirm whether the link is reaching the intended audience.",
                "priority": "low",
                "category": "action"
            }
        ]

    summary = (result.summary or "").strip()
    if not summary:
        summary = "AI insights are available for this link based on its current analytics snapshot."

    return {
        "summary": summary[:500],
        "insights": cleaned_insights[:6],
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "model": settings.OPENAI_MODEL
    }