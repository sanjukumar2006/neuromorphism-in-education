class RecommendationEngine:

    def __init__(self):
        pass

    def calculate_learning_score(
        self,
        quiz_score,
        attention_score,
        revision_score
    ):

        learning_score = (
            quiz_score * 0.4 +
            attention_score * 0.3 +
            revision_score * 0.3
        )

        return round(learning_score, 2)

    def exam_readiness(self, learning_score):

        if learning_score >= 85:
            return "Exam Ready"

        elif learning_score >= 70:
            return "Almost Ready"

        elif learning_score >= 50:
            return "Needs Improvement"

        else:
            return "High Risk"

    def generate_recommendations(
        self,
        learning_score,
        topic_analysis
    ):

        recommendations = []

        if learning_score < 50:
            recommendations.append(
                "Increase daily study time by 30 minutes."
            )

        elif learning_score < 70:
            recommendations.append(
                "Schedule additional revision sessions."
            )

        else:
            recommendations.append(
                "Maintain current study routine."
            )

        for topic, stats in topic_analysis.items():

            if stats["slow_wrong"] >= 2:
                recommendations.append(
                    f"{topic}: High Priority Revision Required"
                )

            elif stats["slow_correct"] >= 2:
                recommendations.append(
                    f"{topic}: More Practice Needed"
                )

            elif stats["fast_wrong"] >= 2:
                recommendations.append(
                    f"{topic}: Avoid Guessing Questions"
                )

            elif stats["mastered"] >= 3:
                recommendations.append(
                    f"{topic}: Topic Mastered"
                )

        return recommendations

    def create_study_plan(
        self,
        topic_analysis
    ):

        study_plan = []

        for topic, stats in topic_analysis.items():

            priority = (
                stats["slow_wrong"] * 5 +
                stats["slow_correct"] * 3 +
                stats["fast_wrong"] * 2
            )

            study_plan.append({
                "topic": topic,
                "priority": priority
            })

        study_plan.sort(
            key=lambda x: x["priority"],
            reverse=True
        )

        return study_plan


# Testing

if __name__ == "__main__":

    engine = RecommendationEngine()

    topic_analysis = {

        "Algebra": {
            "slow_correct": 0,
            "slow_wrong": 3,
            "fast_wrong": 1,
            "mastered": 0
        },

        "Calculus": {
            "slow_correct": 1,
            "slow_wrong": 0,
            "fast_wrong": 0,
            "mastered": 4
        }
    }

    learning_score = engine.calculate_learning_score(
        quiz_score=70,
        attention_score=65,
        revision_score=80
    )

    print("Learning Score:", learning_score)

    print("Exam Status:")
    print(engine.exam_readiness(learning_score))

    print("\nRecommendations:")

    for rec in engine.generate_recommendations(
        learning_score,
        topic_analysis
    ):
        print("-", rec)

    print("\nStudy Plan:")

    for item in engine.create_study_plan(
        topic_analysis
    ):
        print(item)