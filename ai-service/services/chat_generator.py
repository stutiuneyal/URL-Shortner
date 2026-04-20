from datetime import datetime, timezone
from typing import Any

from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from models import ChatRequest
from settings import settings


class ChatResponseSchema(BaseModel):
    answer: str = Field(description="Grounded answer to the user's analytics question")
    suggestedQuestions: list[str] = Field(
        description="Up to 4 useful follow-up questions the user might ask next"
    )


def _safe_model() -> ChatOpenAI:
    if not settings.OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY is not set")

    return ChatOpenAI(
        api_key=settings.OPENAI_API_KEY,
        model=settings.OPENAI_MODEL,
        temperature=0.2
    ).with_structured_output(ChatResponseSchema, method="json_schema")


def _format_conversation(messages: list) -> str:
    if not messages:
        return "[]"

    lines = []
    for msg in messages[-10:]:
        role = (msg.role or "").strip().lower()
        content = (msg.content or "").strip()
        if not content:
            continue
        lines.append(f"{role}: {content}")

    return "\n".join(lines) if lines else "[]"


def _build_prompt(payload: ChatRequest) -> str:
    link = payload.link
    analytics = payload.analytics
    recent_conversation = _format_conversation(payload.messages)

    return f"""
You are an AI analytics assistant for a premium URL shortener platform.

You answer user questions about ONE link using only the provided analytics data and recent conversation context.

Rules:
- Use only the supplied analytics and conversation.
- Do not invent missing facts.
- If data is insufficient, clearly say so.
- Keep answers concise, sharp, and product-like.
- Prefer practical reasoning over generic advice.
- If useful, recommend the next best action.
- Mention geography, devices, browsers, referrals, and trends only when the data supports it.
- Suggested follow-up questions should be short, useful, and directly relevant.

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

Recent conversation:
{recent_conversation}

User question:
{payload.question}
""".strip()


def _normalize_suggested_questions(items: list[str]) -> list[str]:
    cleaned = []
    seen = set()

    for item in items or []:
        question = (item or "").strip()
        if not question:
            continue

        key = question.lower()
        if key in seen:
            continue
        seen.add(key)

        cleaned.append(question[:120])

    return cleaned[:4]


async def generate_chat_response(payload: ChatRequest) -> dict[str, Any]:
    model = _safe_model()
    prompt = _build_prompt(payload)
    result = await model.ainvoke(prompt)

    answer = (result.answer or "").strip()
    if not answer:
        answer = "I could not derive a grounded answer from the current analytics snapshot."

    suggested_questions = _normalize_suggested_questions(result.suggestedQuestions)

    return {
        "answer": answer[:2000],
        "suggestedQuestions": suggested_questions,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "model": settings.OPENAI_MODEL
    }