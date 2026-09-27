import re
from typing import Dict, List

# Curated high-precision tech skills dictionary
TECH_SKILLS = {
    # Programming Languages
    'python', 'javascript', 'typescript', 'java', 'kotlin', 'swift', 'c++', 'c#',
    'golang', 'go', 'rust', 'ruby', 'php', 'scala', 'dart', 'elixir', 'sql',
    # Frontend Technologies
    'react', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular', 'svelte',
    'html', 'css', 'sass', 'tailwind', 'tailwindcss', 'bootstrap',
    'redux', 'zustand', 'graphql', 'vite', 'webpack',
    # Backend Technologies
    'node.js', 'nodejs', 'nestjs', 'express', 'fastapi', 'django', 'flask',
    'spring', 'spring boot', 'laravel', 'ruby on rails', 'asp.net',
    # Databases & Storage
    'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'sqlite', 'cassandra', 'dynamodb', 'firebase', 'prisma',
    # Cloud, DevOps & Infrastructure
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
    'terraform', 'ansible', 'jenkins', 'github actions', 'ci/cd',
    'nginx', 'linux', 'bash',
    # System Architecture & Networking
    'microservices', 'rest api', 'websockets', 'grpc', 'kafka', 'rabbitmq',
    'system design', 'distributed systems',
    # Machine Learning & Data
    'machine learning', 'deep learning', 'tensorflow', 'pytorch',
    'scikit-learn', 'pandas', 'numpy', 'nlp', 'data science',
    # Tools & Practices
    'git', 'github', 'jira', 'agile', 'scrum', 'tdd'
}

SKILL_CANONICAL_NAMES = {
    'nextjs': 'Next.js',
    'next.js': 'Next.js',
    'react': 'React',
    'vue': 'Vue.js',
    'vue.js': 'Vue.js',
    'nodejs': 'Node.js',
    'node.js': 'Node.js',
    'nestjs': 'NestJS',
    'fastapi': 'FastAPI',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'golang': 'Go',
    'go': 'Go',
    'typescript': 'TypeScript',
    'javascript': 'JavaScript',
    'python': 'Python',
    'tailwindcss': 'Tailwind CSS',
    'tailwind': 'Tailwind CSS',
    'aws': 'AWS',
    'gcp': 'GCP',
    'ci/cd': 'CI/CD',
    'rest api': 'REST APIs',
    'websockets': 'WebSockets',
}

class SkillExtractor:
    def extract(self, text: str) -> Dict[str, float]:
        """
        Extracts technology skills from resume or job text,
        returning canonical skill names with confidence levels.
        """
        if not text:
            return {}

        text_lower = text.lower()
        found: Dict[str, float] = {}

        for skill in TECH_SKILLS:
            # Word boundary pattern to avoid matching substrings in unrelated words
            pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
            matches = re.findall(pattern, text_lower)
            if matches:
                occurrences = len(matches)
                # Base confidence 0.75, boost with repeat mentions up to 0.99
                confidence = min(0.99, 0.75 + (occurrences - 1) * 0.08)
                canonical = SKILL_CANONICAL_NAMES.get(skill, skill.title())
                found[canonical] = max(found.get(canonical, 0.0), round(confidence, 2))

        # Sort by confidence descending
        return dict(sorted(found.items(), key=lambda x: x[1], reverse=True))

    def extract_list(self, text: str, min_confidence: float = 0.7) -> List[str]:
        scores = self.extract(text)
        return [skill for skill, conf in scores.items() if conf >= min_confidence]
