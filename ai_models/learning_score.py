# learning_score.py

def calculate_learning_score(
    quiz_score,
    revision_rate,
    focus_score
):
    """
    Calculates overall learning score

    quiz_score: 0-100
    revision_rate: 0-100
    focus_score: 0-100
    """

    learning_score = (
        0.5 * quiz_score +
        0.3 * revision_rate +
        0.2 * focus_score
    )

    return round(learning_score, 2)


if __name__ == "__main__":

    score = calculate_learning_score(
        quiz_score=80,
        revision_rate=70,
        focus_score=90
    )

    print("Learning Score:", score)