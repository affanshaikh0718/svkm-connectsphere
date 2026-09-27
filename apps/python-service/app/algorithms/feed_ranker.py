import time
from datetime import datetime, timezone
from typing import List
from app.models.feed import CandidatePost, RankedPost, ScoreBreakdown, UserContext, AuthorRelationship

class FeedRanker:
    """
    Transparent, deterministic Feed Ranking Algorithm for ConnectSphere.
    
    Formula:
        final_score = (recency_score    * 0.35)
                    + (connection_score * 0.25)
                    + (engagement_score * 0.20)
                    + (interest_score   * 0.15)
                    + (variety_score    * 0.05)
    """

    WEIGHTS = {
        'recency': 0.35,
        'connection': 0.25,
        'engagement': 0.20,
        'interest': 0.15,
        'variety': 0.05,
    }

    CONNECTION_SCORES = {
        AuthorRelationship.CONNECTION: 1.0,
        AuthorRelationship.FOLLOW: 0.7,
        AuthorRelationship.COMPANY_FOLLOW: 0.5,
        AuthorRelationship.NONE: 0.1,
    }

    def __init__(self):
        self.algorithm_version = "1.0.0"

    def calculate_recency_score(self, created_at: datetime) -> float:
        """Time-decay function. Fresh posts score near 1.0; 24h-old posts ~0.29; 48h ~0.17."""
        now = datetime.now(timezone.utc)
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        hours_old = max(0.0, (now - created_at).total_seconds() / 3600.0)
        return 1.0 / (1.0 + hours_old * 0.1)

    def calculate_connection_score(self, relationship: AuthorRelationship) -> float:
        return self.CONNECTION_SCORES.get(relationship, 0.1)

    def calculate_engagement_score(self, likes: int, comments: int, shares: int) -> float:
        """Normalized engagement. Weighted: like=1, comment=3, share=5."""
        raw_score = (likes * 1) + (comments * 3) + (shares * 5)
        return min(1.0, raw_score / 100.0)

    def calculate_interest_score(self, post_tags: List[str], user_skills: List[str]) -> float:
        """Overlap between post tags/topics and user's profile skills."""
        if not user_skills or not post_tags:
            return 0.0
        post_tags_lower = {tag.strip().lower() for tag in post_tags if tag}
        user_skills_lower = {skill.strip().lower() for skill in user_skills if skill}
        if not post_tags_lower or not user_skills_lower:
            return 0.0
        matches = len(post_tags_lower & user_skills_lower)
        return min(1.0, matches / max(len(post_tags_lower), 1))

    def calculate_variety_score(self, author_id: str, author_counts: dict) -> float:
        """Penalize excessive consecutive posts by the same author to ensure feed diversity."""
        count = author_counts.get(author_id, 0)
        if count == 0:
            return 1.0
        elif count == 1:
            return 0.8
        elif count == 2:
            return 0.5
        else:
            return 0.2

    def rank(self, posts: List[CandidatePost], user_context: UserContext) -> List[RankedPost]:
        # Filter out hidden or dismissed posts
        hidden = set(user_context.hidden_post_ids)
        eligible_posts = [p for p in posts if p.post_id not in hidden]

        # Initial sort to apply variety penalties predictably
        sorted_candidates = sorted(
            eligible_posts,
            key=lambda p: (
                self.CONNECTION_SCORES.get(p.author_relationship, 0.1),
                p.created_at
            ),
            reverse=True
        )

        author_counts: dict = {}
        ranked: List[RankedPost] = []

        for post in sorted_candidates:
            recency = self.calculate_recency_score(post.created_at)
            connection = self.calculate_connection_score(post.author_relationship)
            engagement = self.calculate_engagement_score(
                post.like_count, post.comment_count, post.share_count
            )
            interest = self.calculate_interest_score(post.post_tags, user_context.skills)
            variety = self.calculate_variety_score(post.author_id, author_counts)

            final_score = (
                recency    * self.WEIGHTS['recency'] +
                connection * self.WEIGHTS['connection'] +
                engagement * self.WEIGHTS['engagement'] +
                interest   * self.WEIGHTS['interest'] +
                variety    * self.WEIGHTS['variety']
            )

            breakdown = ScoreBreakdown(
                recency=round(recency, 4),
                connection=round(connection, 4),
                engagement=round(engagement, 4),
                interest=round(interest, 4),
                variety=round(variety, 4),
                final=round(final_score, 4)
            )

            ranked.append(RankedPost(
                post_id=post.post_id,
                score=round(final_score, 4),
                score_breakdown=breakdown
            ))

            author_counts[post.author_id] = author_counts.get(post.author_id, 0) + 1

        # Sort strictly descending by final score
        ranked.sort(key=lambda x: x.score, reverse=True)
        return ranked
