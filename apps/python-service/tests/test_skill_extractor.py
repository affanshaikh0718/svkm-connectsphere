import pytest
from app.algorithms.skill_extractor import SkillExtractor

def test_skill_extractor_accuracy():
    extractor = SkillExtractor()
    sample_text = """
    Experienced Software Engineer proficient in TypeScript, React, NextJS, and Python.
    Built production backend microservices using NestJS, PostgreSQL, and Redis.
    Deployed containerized systems to AWS with Docker and Kubernetes.
    """

    found = extractor.extract(sample_text)

    assert "TypeScript" in found
    assert "React" in found
    assert "Next.js" in found
    assert "Python" in found
    assert "NestJS" in found
    assert "PostgreSQL" in found
    assert "Redis" in found
    assert "AWS" in found
    assert "Docker" in found
    assert "Kubernetes" in found

    # Confidence check
    assert found["TypeScript"] >= 0.75
