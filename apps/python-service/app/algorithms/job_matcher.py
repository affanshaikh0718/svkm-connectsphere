from typing import List
from app.models.jobs import CandidateJob, MatchedJob

class JobMatcher:
    """
    Computes profile-to-job compatibility based on skill intersection,
    identifying matching qualifications and skill gaps.
    """
    def match(self, user_skills: List[str], jobs: List[CandidateJob]) -> List[MatchedJob]:
        user_skills_set = {s.strip().lower() for s in user_skills if s}
        matches: List[MatchedJob] = []

        for job in jobs:
            job_skills_lower = {s.strip().lower(): s for s in job.required_skills if s}
            if not job_skills_lower:
                # If no skills specified, give baseline neutral score
                matches.append(MatchedJob(
                    job_id=job.job_id,
                    title=job.title,
                    match_score=0.5,
                    matching_skills=[],
                    missing_skills=[]
                ))
                continue

            matching_raw = set(job_skills_lower.keys()) & user_skills_set
            missing_raw = set(job_skills_lower.keys()) - user_skills_set

            matching_display = [job_skills_lower[k] for k in matching_raw]
            missing_display = [job_skills_lower[k] for k in missing_raw]

            score = len(matching_raw) / float(len(job_skills_lower))

            matches.append(MatchedJob(
                job_id=job.job_id,
                title=job.title,
                match_score=round(score, 3),
                matching_skills=matching_display,
                missing_skills=missing_display
            ))

        # Sort jobs by highest match score first
        matches.sort(key=lambda m: m.match_score, reverse=True)
        return matches
