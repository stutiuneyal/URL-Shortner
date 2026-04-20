from typing import List, Optional, Literal
from pydantic import BaseModel, Field, HttpUrl


# ----------------------------
# slug models
# ----------------------------

class SlugSuggestionRequest(BaseModel):
    target: HttpUrl
    workspace_id: str = Field(alias="workspaceId")
    domain_id: Optional[str] = Field(default=None, alias="domainId")
    brand_hint: Optional[str] = Field(default=None, alias="brandHint")


class SlugSuggestionItem(BaseModel):
    slug: str = Field(min_length=4, max_length=32)
    reason: str
    style: Literal["seo", "brandable", "technical", "clean"]


class SlugSuggestionResponse(BaseModel):
    suggestions: List[SlugSuggestionItem]


# ----------------------------
# AI Insights models
# ----------------------------

class BreakdownItem(BaseModel):
    label: str
    value: int


class TimelinePoint(BaseModel):
    label: str
    clicks: int


class RecentClickItem(BaseModel):
    createdAt: Optional[str] = None
    referer: Optional[str] = None
    browser: Optional[str] = None
    deviceType: Optional[str] = None
    country: Optional[str] = None


class LinkMetadata(BaseModel):
    id: str
    workspaceId: str
    slug: Optional[str] = None
    target: Optional[str] = None
    createdAt: Optional[str] = None
    clicks: Optional[int] = 0
    active: Optional[bool] = True
    expiresAt: Optional[str] = None


class LinkAnalyticsPayload(BaseModel):
    timeline: List[TimelinePoint] = Field(default_factory=list)
    countries: List[BreakdownItem] = Field(default_factory=list)
    devices: List[BreakdownItem] = Field(default_factory=list)
    browsers: List[BreakdownItem] = Field(default_factory=list)
    referrers: List[BreakdownItem] = Field(default_factory=list)
    recentClicks: List[RecentClickItem] = Field(default_factory=list)


class InsightRequest(BaseModel):
    link: LinkMetadata
    analytics: LinkAnalyticsPayload


class InsightItem(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=8, max_length=500)
    priority: Literal["high", "medium", "low"]
    category: Literal[
        "traffic",
        "geo",
        "device",
        "browser",
        "referral",
        "anomaly",
        "timing",
        "action"
    ]


class InsightResponse(BaseModel):
    summary: str = Field(min_length=10, max_length=500)
    insights: List[InsightItem] = Field(min_length=3, max_length=6)
    generatedAt: str
    model: str


# ----------------------------
# Conversational AI models
# ----------------------------

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    link: LinkMetadata
    analytics: LinkAnalyticsPayload
    messages: List[ChatMessage] = Field(default_factory=list)
    question: str


class ChatResponse(BaseModel):
    answer: str
    suggestedQuestions: List[str] = Field(default_factory=list)
    generatedAt: str
    model: str