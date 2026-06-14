# planner.py

def get_priority(score):

    if score < 50:
        return "High"

    elif score < 80:
        return "Medium"

    else:
        return "Low"


def get_study_time(score):

    if score < 50:
        return 90

    elif score < 80:
        return 60

    else:
        return 30


def generate_plan(subjects):

    plan = []

    for subject in subjects:

        name = subject["name"]
        score = subject["score"]

        plan.append({
            "subject": name,
            "score": score,
            "priority": get_priority(score),
            "study_time": get_study_time(score)
        })

    plan.sort(
        key=lambda x: x["study_time"],
        reverse=True
    )

    return plan