class AttentionTracker:

    def __init__(self):
        self.questions = []

    def add_question_attempt(
        self,
        topic,
        expected_time,
        actual_time,
        correct
    ):

        self.questions.append({
            "topic": topic,
            "expected_time": expected_time,
            "actual_time": actual_time,
            "correct": correct
        })

    def calculate_attention_score(self):

        if len(self.questions) == 0:
            return 0

        total_score = 0

        for q in self.questions:

            expected = q["expected_time"]
            actual = q["actual_time"]
            correct = q["correct"]

            ratio = actual / expected

            # Time Evaluation

            if 0.7 <= ratio <= 1.5:
                time_score = 100

            elif 1.5 < ratio <= 2.5:
                time_score = 70

            else:
                time_score = 40

            # Accuracy Evaluation

            accuracy_score = 100 if correct else 40

            question_score = (
                time_score * 0.5 +
                accuracy_score * 0.5
            )

            total_score += question_score

        return round(total_score / len(self.questions), 2)

    def get_topic_analysis(self):

        topic_data = {}

        for q in self.questions:

            topic = q["topic"]

            if topic not in topic_data:
                topic_data[topic] = {
                    "slow_correct": 0,
                    "slow_wrong": 0,
                    "fast_wrong": 0,
                    "mastered": 0
                }

            ratio = q["actual_time"] / q["expected_time"]

            if ratio > 2 and q["correct"]:
                topic_data[topic]["slow_correct"] += 1

            elif ratio > 2 and not q["correct"]:
                topic_data[topic]["slow_wrong"] += 1

            elif ratio < 0.5 and not q["correct"]:
                topic_data[topic]["fast_wrong"] += 1

            elif ratio <= 1.5 and q["correct"]:
                topic_data[topic]["mastered"] += 1

        return topic_data

    def get_recommendations(self):

        analysis = self.get_topic_analysis()

        recommendations = []

        for topic, stats in analysis.items():

            if stats["slow_wrong"] >= 2:
                recommendations.append(
                    f"{topic}: HIGH PRIORITY REVISION"
                )

            elif stats["slow_correct"] >= 2:
                recommendations.append(
                    f"{topic}: Needs more practice"
                )

            elif stats["fast_wrong"] >= 2:
                recommendations.append(
                    f"{topic}: Avoid rushing"
                )

            elif stats["mastered"] >= 3:
                recommendations.append(
                    f"{topic}: Well Understood"
                )

        return recommendations


# Testing

if __name__ == "__main__":

    tracker = AttentionTracker()

    tracker.add_question_attempt(
        topic="Algebra",
        expected_time=30,
        actual_time=90,
        correct=False
    )

    tracker.add_question_attempt(
        topic="Algebra",
        expected_time=30,
        actual_time=80,
        correct=False
    )

    tracker.add_question_attempt(
        topic="Calculus",
        expected_time=45,
        actual_time=40,
        correct=True
    )

    print("Attention Score:")
    print(tracker.calculate_attention_score())

    print("\nTopic Analysis:")
    print(tracker.get_topic_analysis())

    print("\nRecommendations:")
    for r in tracker.get_recommendations():
        print("-", r)