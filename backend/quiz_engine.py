import time

class QuizEngine:

    def __init__(self):

        self.questions = {

            "Maths": [

                {
                    "topic": "Algebra",
                    "question": "2x + 4 = 10. Find x.",
                    "answer": "3",
                    "expected_time": 30
                },

                {
                    "topic": "Algebra",
                    "question": "5x = 25. Find x.",
                    "answer": "5",
                    "expected_time": 20
                }
            ],

            "Physics": [

                {
                    "topic": "Motion",
                    "question": "SI unit of velocity?",
                    "answer": "m/s",
                    "expected_time": 15
                },

                {
                    "topic": "Motion",
                    "question": "Speed = Distance / ?",
                    "answer": "time",
                    "expected_time": 15
                }
            ]
        }

    def get_questions(self, subject):

        return self.questions.get(subject, [])

    def evaluate_answer(self, correct_answer, user_answer):

        return str(correct_answer).lower().strip() == \
               str(user_answer).lower().strip()

    def submit_question(
        self,
        question_data,
        user_answer,
        time_taken
    ):

        is_correct = self.evaluate_answer(
            question_data["answer"],
            user_answer
        )

        return {

            "topic": question_data["topic"],

            "correct": is_correct,

            "expected_time":
                question_data["expected_time"],

            "actual_time":
                time_taken
        }

    def calculate_quiz_score(self, results):

        if len(results) == 0:
            return 0

        correct = sum(
            1 for r in results
            if r["correct"]
        )

        return round(
            (correct / len(results)) * 100,
            2
        )


# Testing

if __name__ == "__main__":

    engine = QuizEngine()

    questions = engine.get_questions("Maths")

    results = []

    for q in questions:

        print("\nQuestion:")
        print(q["question"])

        start = time.time()

        user_answer = input("Answer: ")

        end = time.time()

        result = engine.submit_question(
            q,
            user_answer,
            round(end - start)
        )

        results.append(result)

    print("\nResults")

    for r in results:
        print(r)

    print(
        "\nQuiz Score:",
        engine.calculate_quiz_score(results)
    )