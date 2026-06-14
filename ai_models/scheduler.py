# scheduler.py  (ai_models/)
# Fixed import to use package-relative path

from ai_models.priority_calculator import (
    calculate_priority,
    get_priority_label
)


def generate_schedule(topics):
    """
    topics: list of dicts with keys:
        name, mistake_rate (0-100), days_since_revision, exam_weight (0-100)

    Returns sorted list: [{topic, priority, study_time}, ...]
    """
    schedule = []

    for topic in topics:
        priority_score = calculate_priority(
            topic.get("mistake_rate", 50),
            topic.get("days_since_revision", 1),
            topic.get("exam_weight", 50)
        )

        priority_level = get_priority_label(priority_score)

        if priority_level == "High":
            study_time = 90
        elif priority_level == "Medium":
            study_time = 60
        else:
            study_time = 30

        schedule.append({
            "topic":       topic["name"],
            "priority":    priority_level,
            "study_time":  study_time,
            "priority_score": priority_score
        })

    schedule.sort(key=lambda x: x["study_time"], reverse=True)
    return schedule


if __name__ == "__main__":
    topics = [
        {"name": "Optics",            "mistake_rate": 80, "days_since_revision": 10, "exam_weight": 90},
        {"name": "Organic Chemistry", "mistake_rate": 50, "days_since_revision":  5, "exam_weight": 70},
        {"name": "Calculus",          "mistake_rate": 20, "days_since_revision":  2, "exam_weight": 40},
    ]
    for item in generate_schedule(topics):
        print(item)