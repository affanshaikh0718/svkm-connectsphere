from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime
from enum import Enum

class AuthorRelationship(str, Enum):
    CONNECTION = "CONNECTION"
    FOLLOW = "FOLLOW"
    COMPANY_FOLLOW = "COMPANY_FOLLOW"
    NONE = "NONE"

class CandidatePost(BaseModel):
    post_id: str
    author_id: str
    created_at: datetime
    like_count: int = 0
    comment_count: int = 0
    share_count: int = 0
    author_relationship: AuthorRelationship = AuthorRelationship.NONE
    post_tags: List[str] = Field(default_factory=list)
    author_follower_count: int = 0

class UserContext(BaseModel):
    skills: List[str] = Field(default_factory=list)
    recent_post_interactions: List[str] = Field(default_factory=list)
    author_interaction_counts: Dict[str, int] = Field(default_factory=dict)
    hidden_post_ids: List[str] = Field(default_factory=list)

class RankRequest(BaseModel):
    user_id: str
    candidate_posts: List[CandidatePost]
    user_context: UserContext

class ScoreBreakdown(BaseModel):
    recency: float
    connection: float
    engagement: float
    interest: float
    variety: float
    final: float

class RankedPost(BaseModel):
    post_id: str
    score: float
    score_breakdown: ScoreBreakdown

class RankResponse(BaseModel):
    ranked_posts: List[RankedPost]
    total_candidates: int
    processing_time_ms: float
    algorithm_version: str = "1.0.0"
