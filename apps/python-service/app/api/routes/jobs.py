import time
from fastapi import APIRouter
from app.models.jobs import MatchJobsRequest, MatchJobsResponse
from app.algorithms.job_matcher import JobMatcher

router = APIRouter(prefix="/jobs", tags=["Job Matching"])
matcher = JobMatcher()

@router.post("/match", response_model=MatchJobsResponse)
async def match_candidate_jobs(payload: MatchJobsRequest):
    start_time = time.time()
    matches = matcher.match(payload.user_skills, payload.candidate_jobs)
    elapsed_ms = (time.time() - start_time) * 1000.0

    return MatchJobsResponse(
        matches=matches,
        total_evaluated=len(payload.candidate_jobs),
        processing_time_ms=round(elapsed_ms, 2)
    )
