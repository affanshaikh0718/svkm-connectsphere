from pydantic import BaseModel, Field
from typing import List

class CandidateJob(BaseModel):
    job_id: str
    title: str
    required_skills: List[str] = Field(default_factory=list)
    location_type: str = "REMOTE"

class MatchJobsRequest(BaseModel):
    user_skills: List[str] = Field(default_factory=list)
    candidate_jobs: List[CandidateJob]

class MatchedJob(BaseModel):
    job_id: str
    title: str
    match_score: float
    matching_skills: List[str]
    missing_skills: List[str]

class MatchJobsResponse(BaseModel):
    matches: List[MatchedJob]
    total_evaluated: int
    processing_time_ms: float
