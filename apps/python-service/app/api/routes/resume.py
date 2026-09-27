import time
from fastapi import APIRouter
from app.models.resume import ExtractSkillsRequest, ExtractSkillsResponse
from app.algorithms.skill_extractor import SkillExtractor

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])
extractor = SkillExtractor()

@router.post("/extract-skills", response_model=ExtractSkillsResponse)
async def extract_resume_skills(payload: ExtractSkillsRequest):
    start_time = time.time()
    extracted_dict = extractor.extract(payload.resume_text)
    elapsed_ms = (time.time() - start_time) * 1000.0

    skills_list = list(extracted_dict.keys())

    return ExtractSkillsResponse(
        skills=skills_list,
        confidence_scores=extracted_dict,
        total_found=len(skills_list),
        processing_time_ms=round(elapsed_ms, 2)
    )
