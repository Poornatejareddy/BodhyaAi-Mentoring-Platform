"""
Knowledge Base Seed Data for RAG System
Contains curated educational content across multiple domains
"""

from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# ============================================================================
# STUDY STRATEGIES (5 documents)
# ============================================================================

STUDY_STRATEGIES = [
    {
        "title": "Pomodoro Technique for Better Focus",
        "category": "study_strategies",
        "tags": ["time_management", "focus", "productivity"],
        "content": """
        The Pomodoro Technique involves breaking your study time into focused 25-minute intervals (Pomodoros), 
        separated by short 5-minute breaks. After four Pomodoros, take a longer break (15-30 minutes). During 
        each 25-minute session, eliminate distractions, close unnecessary tabs, and focus solely on one task. Use a timer to track your sessions. The breaks are 
        crucial - use them to stretch, walk around, or do something completely different from studying. Many students 
        find this technique helps them study for longer periods without feeling overwhelmed.
        """
    },
    {
        "title": "Active Recall: The Most Effective Study Method",
        "category": "study_strategies",
        "tags": ["active_recall", "memory", "learning"],
        "content": """
        Active recall is one of the most scientifically-proven effective study techniques. Instead of passively 
        re-reading notes, you actively try to retrieve information from memory. Here's how to implement it: 
        After reading a section, close your book and write down everything you remember. Create flashcards with 
        questions on one side and answers on the other. Practice explaining concepts out loud without looking at 
        your notes. Test yourself regularly using practice questions. The struggle to remember actually strengthens 
        neural connections. Research shows active recall is significantly more effective than highlighting or 
        re-reading. Make it a habit to quiz yourself rather than just reviewing material passively.
        """
    },
    {
        "title": "Spaced Repetition for Long-term Retention",
        "category": "study_strategies",
        "tags": ["spaced_repetition", "memory", "retention"],
        "content": """
        Spaced repetition is a learning technique that involves reviewing information at increasing intervals. 
        This combats the forgetting curve and moves knowledge into long-term memory. Here's a simple schedule: 
        Review material 1 day after learning, then 3 days later, then 7 days, then 14 days, then 30 days. Apps 
        like Anki can automate this process. The key is to review just as you're about to forget - this strengthens 
        memory more than reviewing too early. For exam preparation, start your spaced repetition schedule early. 
        Don't cram - distributed practice over weeks is far superior to massed practice. Combine spaced repetition 
        with active recall for maximum effectiveness.
        """
    },
    {
        "title": "Cornell Note-Taking Method",
        "category": "study_strategies",
        "tags": ["note_taking", "organization", "review"],
        "content": """
        The Cornell Note-Taking System is a structured method that improves both note-taking and review. Divide 
        your page into three sections: a narrow left column (cue column), a wider right column (notes column), 
        and a bottom section (summary). During lectures, take notes in the main right column. After class, write 
        questions or keywords in the left cue column that correspond to your notes. At the bottom, write a brief 
        summary of the page. When reviewing, cover the right column and use the cues to test your recall. This 
        system forces you to process information actively and creates built-in review tools. It's particularly 
        effective for lecture-heavy courses.
        """
    },
    {
        "title": "Feynman Technique for Deep Understanding",
        "category": "study_strategies",
        "tags": ["understanding", "explanation", "learning"],
        "content": """
        The Feynman Technique helps you truly understand concepts rather than just memorize them. Named after 
        physicist Richard Feynman, here's the process: (1) Choose a concept to learn. (2) Explain it in simple 
        terms as if teaching a child. (3) Identify gaps in your explanation - these reveal what you don't 
        understand. (4) Go back to source material and re-learn the gaps. (5) Simplify and use analogies. 
        If you can't explain something simply, you don't understand it well enough. This technique forces active 
        engagement with material and reveals weaknesses in understanding. It's especially useful for technical 
        subjects like mathematics, physics, and computer science.
        """
    }
]

# Mathematics & Science
MATHEMATICS_GUIDES = [
    {
        "title": "Mastering Calculus: Derivatives Fundamentals",
        "category": "mathematics",
        "tags": ["calculus", "derivatives", "mathematics"],
        "content": """
        Understanding derivatives is crucial for calculus success. A derivative represents the rate of change 
        of a function. Geometrically, it's the slope of the tangent line at a point. Key rules to master: 
        Power rule (d/dx[x^n] = nx^(n-1)), Product rule ((fg)' = f'g + fg'), Quotient rule ((f/g)' = (f'g-fg')/g^2), 
        and Chain rule (d/dx[f(g(x))] = f'(g(x))·g'(x)). Practice is essential - work through many problems 
        systematically. Start with simple polynomials, then move to trigonometric, exponential, and logarithmic 
        functions. Understand the relationship between derivatives and graphs. Remember that the derivative of 
        position is velocity, and the derivative of velocity is acceleration - these physical interpretations 
        can aid understanding.
        """
    },
    {
        "title": "Data Structures: Arrays and Linked Lists",
        "category": "computer_science",
        "tags": ["data_structures", "programming", "algorithms"],
        "content": """
        Arrays and linked lists are fundamental data structures with different trade-offs. Arrays: Provide O(1) 
        random access, contiguous memory, fixed or dynamic size. Advantages: Fast access by index, cache-friendly. 
        Disadvantages: Insertion/deletion in middle is O(n), may waste space. Linked Lists: Nodes with data and 
        pointers, dynamic size, non-contiguous memory. Advantages: O(1) insertion/deletion at known positions, 
        no wasted space. Disadvantages: O(n) access by index, extra memory for pointers, not cache-friendly. 
        Choose arrays when you need fast random access and know the size. Choose linked lists when you frequently 
        insert/delete elements and don't need random access. Understanding these basics is crucial for algorithm 
        design and technical interviews.
        """
    }
]

# Mental Health & Wellbeing
MENTAL_HEALTH_RESOURCES = [
    {
        "title": "Managing Academic Stress Effectively",
        "category": "mental_health",
        "tags": ["stress_management", "wellbeing", "coping"],
        "content": """
        Academic stress is normal, but managing it is crucial for success and wellbeing. Recognize warning signs: 
        difficulty concentrating, sleep problems, irritability, physical symptoms like headaches. Healthy coping 
        strategies include: (1) Time management - break large tasks into smaller ones, use a planner, prioritize. 
        (2) Physical activity - even 20 minutes of exercise reduces stress hormones. (3) Adequate sleep - aim for 
        7-9 hours; sleep deprivation amplifies stress. (4) Social support - talk to friends, family, or counselors. 
        (5) Mindfulness and breathing exercises - even 5 minutes daily helps. (6) Maintain boundaries - know when 
        to say no and protect personal time. (7) Healthy eating - good nutrition supports mental health. Remember, 
        seeking help is a sign of strength, not weakness. Use campus counseling services if stress becomes overwhelming.
        """
    },
    {
        "title": "Overcoming Procrastination",
        "category": "productivity",
        "tags": ["procrastination", "motivation", "habits"],
        "content": """
        Procrastination is often rooted in anxiety, perfectionism, or lack of motivation - not laziness. To overcome 
        it: (1) Start tiny - commit to just 2 minutes of work. Often, starting is the hardest part. (2) Break tasks 
        into micro-steps - "write essay" becomes "open document," "write thesis sentence," etc. (3) Use implementation 
        intentions - "If it's 2pm, then I will study calculus for 25 minutes" works better than vague plans. (4) Remove 
        obstacles - prepare your study space in advance. (5) Reward yourself after completing tasks. (6) Forgive 
        yourself for past procrastination - self-compassion improves future behavior. (7) Identify your peak energy 
        times and schedule important work then. (8) Use accountability - study groups or check-ins with friends help. 
        Remember that action precedes motivation, not the other way around.
        """
    },
    {
        "title": "Building Resilience and Growth Mindset",
        "category": "mental_health",
        "tags": ["resilience", "mindset", "personal_growth"],
        "content": """
        Resilience is the ability to bounce back from setbacks - a crucial skill for academic success. Develop a 
        growth mindset: believe that intelligence and abilities can be developed through effort. View challenges as 
        opportunities to grow, not threats. When you fail, ask "What can I learn?" instead of "Why me?" Strategies 
        for building resilience: (1) Reframe negative self-talk - replace "I can't do this" with "I can't do this yet." 
        (2) Focus on process over outcome - effort matters more than natural talent. (3) Celebrate small wins and 
        progress. (4) Learn from successful people's failures - every expert was once a beginner. (5) Practice 
        self-compassion - treat yourself as you would a good friend. (6) Maintain perspective - one bad grade doesn't 
        define you. (7) Develop problem-solving skills - break down obstacles systematically. Research shows that 
        growth mindset students achieve more and handle stress better.
        """
    }
]

# Academic Skills
ACADEMIC_SKILLS = [
    {
        "title": "Effective Test-Taking Strategies",
        "category": "academic_skills",
        "tags": ["exams", "test_taking", "performance"],
        "content": """
        Test-taking is a skill that can be learned and improved. Before the exam: Space out your studying over weeks, 
        get good sleep the night before, eat a healthy meal, arrive early to settle in. During the exam: (1) Read 
        instructions carefully - many students lose points by not following directions. (2) Scan the entire exam first 
        to budget time. (3) Start with questions you know to build confidence and secure easy points. (4) For multiple 
        choice, eliminate obviously wrong answers first. (5) Show all work on math problems - partial credit matters. 
        (6) For essays, outline before writing. (7) Don't change answers unless you're certain - first instincts are 
        often correct. (8) Leave time to review - check for careless errors. If you go blank, take deep breaths, 
        skip the question, and return later. Test anxiety is normal - preparation and practice reduce it significantly.
        """
    },
    {
        "title": "Research and Citation Fundamentals",
        "category": "academic_skills",
        "tags": ["research", "writing", "citations"],
        "content": """
        Strong research skills are essential for academic success. Start with a clear research question. Use academic 
        databases like Google Scholar, JSTOR, or your library's resources - Wikipedia is a starting point, not a source. 
        Evaluate sources critically: Is the author credible? Is it peer-reviewed? Is it recent? Is there bias? Take 
        organized notes with full citation information from the start. Keep track of where each fact comes from to avoid 
        accidental plagiarism. Understand different citation styles (APA, MLA, Chicago) - your field usually has a standard. 
        Use citation management tools like Zotero or Mendeley. When writing: Cite direct quotes, paraphrased ideas, and 
        specific facts. Common knowledge doesn't need citation. "When in doubt, cite it out" - over-citing is better than 
        plagiarism. Learn the difference between paraphrasing (rewording in your own words + citation) and quoting 
        (exact words + quotation marks + citation).
        """
    },
    {
        "title": "Time Management for Students",
        "category": "academic_skills",
        "tags": ["time_management", "planning", "productivity"],
        "content": """
        Effective time management is the foundation of academic success. Start with a semester calendar - mark all 
        assignment due dates, exams, and commitments. Use a weekly planner to break down tasks. Time management principles: 
        (1) Prioritize using the Eisenhower Matrix - urgent & important first, then important but not urgent. (2) Schedule 
        specific study blocks, not just "study sometime." (3) Use time-blocking - assign tasks to specific time slots. 
        (4) Account for how long tasks actually take - most students underestimate. (5) Build in buffer time for unexpected 
        issues. (6) Protect your time - learn to say no to lower-priority requests. (7) Batch similar tasks together for 
        efficiency. (8) Schedule breaks and personal time - burnout reduces productivity. (9) Review and adjust your system 
        weekly. (10) Use the 2-minute rule - if something takes less than 2 minutes, do it now. Remember, planning time 
        saves execution time.
        """
    }
]

# Engineering Specific
ENGINEERING_GUIDES = [
    {
        "title": "Problem-Solving Strategies for Engineering",
        "category": "engineering",
        "tags": ["problem_solving", "engineering", "methodology"],
        "content": """
        Engineering problems require systematic approaches. Follow this framework: (1) Understand the problem - read 
        carefully, identify what's given and what's asked, draw diagrams. (2) Plan your approach - what principles 
        apply? What equations are relevant? Break complex problems into sub-problems. (3) Execute your solution - 
        show all steps, include units, use consistent notation. (4) Check your answer - does it make physical sense? 
        Are the units correct? Try limiting cases (what if a variable is 0 or infinity?). For difficult problems, 
        try working backwards from the desired result. Look for symmetry or patterns. Estimate the order of magnitude 
        before calculating precisely. Practice regularly - problem-solving is a skill that improves with deliberate 
        practice. Review solutions to understand not just what the answer is, but why that approach works.
        """
    }
]


def get_all_seed_documents() -> List[Dict]:
    """
    Get all seed documents for knowledge base initialization
    
    Returns:
        List of document dicts with text, source, category, tags
    """
    all_docs = []
    
    # Add all document collections
    collections = [
        ("study_strategies", STUDY_STRATEGIES),
        ("mathematics", MATHEMATICS_GUIDES),
        ("mental_health", MENTAL_HEALTH_RESOURCES),
        ("academic_skills", ACADEMIC_SKILLS),
        ("engineering", ENGINEERING_GUIDES)
    ]
    
    for collection_name, documents in collections:
        for doc in documents:
            all_docs.append({
                'text': doc['content'],
                'source': f"{collection_name}/{doc['title']}",
                'category': doc['category'],
                'tags': doc['tags']
            })
    
    logger.info(f"Retrieved {len(all_docs)} seed documents")
    return all_docs


def get_documents_by_category(category: str) -> List[Dict]:
    """Get documents filtered by category"""
    all_docs = get_all_seed_documents()
    return [doc for doc in all_docs if doc['category'] == category]


def get_documents_by_tag(tag: str) -> List[Dict]:
    """Get documents filtered by tag"""
    all_docs = get_all_seed_documents()
    return [doc for doc in all_docs if tag in doc.get('tags', [])]
