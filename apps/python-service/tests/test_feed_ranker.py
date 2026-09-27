import pytest
from datetime import datetime, timezone, timedelta
from app.algorithms.feed_ranker import FeedRanker
from app.models.feed import CandidatePost, UserContext, AuthorRelationship

def test_feed_ranker_decay():
    ranker = FeedRanker()
    now = datetime.now(timezone.utc)
    fresh_score = ranker.calculate_recency_score(now)
    old_score = ranker.calculate_recency_score(now - timedelta(hours=24))

    assert fresh_score > old_score
    assert fresh_score >= 0.99
    assert old_score < 0.35

def test_feed_ranker_connection_weight():
    ranker = FeedRanker()
    conn_score = ranker.calculate_connection_score(AuthorRelationship.CONNECTION)
    follow_score = ranker.calculate_connection_score(AuthorRelationship.FOLLOW)
    none_score = ranker.calculate_connection_score(AuthorRelationship.NONE)

    assert conn_score > follow_score > none_score

def test_feed_ranker_ranking_ordering():
    ranker = FeedRanker()
    now = datetime.now(timezone.utc)

    post1 = CandidatePost(
        post_id="p1",
        author_id="a1",
        created_at=now,
        like_count=50,
        comment_count=10,
        share_count=5,
        author_relationship=AuthorRelationship.CONNECTION,
        post_tags=["NestJS", "TypeScript"],
    )

    post2 = CandidatePost(
        post_id="p2",
        author_id="a2",
        created_at=now - timedelta(hours=36),
        like_count=2,
        comment_count=0,
        share_count=0,
        author_relationship=AuthorRelationship.NONE,
        post_tags=["Unrelated"],
    )

    context = UserContext(skills=["TypeScript", "NestJS"])
    ranked = ranker.rank([post2, post1], context)

    assert len(ranked) == 2
    assert ranked[0].post_id == "p1"
    assert ranked[0].score > ranked[1].score
