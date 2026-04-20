from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal


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