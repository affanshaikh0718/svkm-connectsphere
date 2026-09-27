import time
from fastapi import APIRouter
from app.models.feed import RankRequest, RankResponse
from app.algorithms.feed_ranker import FeedRanker

router = APIRouter(prefix="/feed", tags=["Feed Recommendation"])
ranker = FeedRanker()

@router.post("/rank", response_model=RankResponse)
async def rank_feed_candidates(payload: RankRequest):
    start_time = time.time()
    ranked = ranker.rank(payload.candidate_posts, payload.user_context)
    elapsed_ms = (time.time() - start_time) * 1000.0

    return RankResponse(
        ranked_posts=ranked,
        total_candidates=len(payload.candidate_posts),
        processing_time_ms=round(elapsed_ms, 2),
        algorithm_version=ranker.algorithm_version
    )
