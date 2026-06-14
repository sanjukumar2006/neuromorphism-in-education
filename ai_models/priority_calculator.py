# priority_calculator.py  (ai_models/)

def calculate_priority(
    mistake_rate,
    days_since_revision,
    exam_weight
):
    """
    Higher score = Higher priority

    mistake_rate        : 0-100  (% of wrong answers)
    days_since_revision : days since last studied
    exam_weight         : 0-100  (importance / closeness of exam)
    """
    priority_score = (
        0.5 * mistake_rate +
        0.3 * min(days_since_revision, 30) +   # cap at 30 days
        0.2 * exam_weight
    )
    return round(priority_score, 2)


def get_priority_label(score):
    if score >= 70:
        return "High"
    elif score >= 40:
        return "Medium"
    else:
        return "Low"


if __name__ == "__main__":
    score = calculate_priority(
        mistake_rate=80,
        days_since_revision=10,
        exam_weight=90
    )
    print("Priority Score:", score)
    print("Priority Level:", get_priority_label(score))