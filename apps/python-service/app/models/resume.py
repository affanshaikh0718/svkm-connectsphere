from pydantic import BaseModel, Field
from typing import List, Dict

class ExtractSkillsRequest(BaseModel):
    resume_text: str = Field(..., description="Extracted plain text from candidate resume")

class ExtractSkillsResponse(BaseModel):
    skills: List[str]
    confidence_scores: Dict[str, float]
    total_found: int
    processing_time_ms: float
