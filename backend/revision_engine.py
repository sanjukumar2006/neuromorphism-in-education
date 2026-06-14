from datetime import datetime, timedelta

class RevisionEngine:

    def __init__(self):
        pass

    def get_next_revision_date(self, revision_count):
        """
        Spaced repetition schedule:
        Revision 1 -> 1 day
        Revision 2 -> 3 days
        Revision 3 -> 7 days
        Revision 4 -> 15 days
        Revision 5+ -> 30 days
        """

        today = datetime.now()

        if revision_count == 1:
            return today + timedelta(days=1)

        elif revision_count == 2:
            return today + timedelta(days=3)

        elif revision_count == 3:
            return today + timedelta(days=7)

        elif revision_count == 4:
            return today + timedelta(days=15)

        else:
            return today + timedelta(days=30)

    def calculate_revision_score(self, completed, scheduled):
        """
        Calculates revision consistency score.
        """

        if scheduled == 0:
            return 100

        score = (completed / scheduled) * 100

        return round(score, 2)

    def get_revision_priority(self, days_since_revision):
        """
        Determines urgency of revision.
        """

        if days_since_revision >= 14:
            return "HIGH"

        elif days_since_revision >= 7:
            return "MEDIUM"

        else:
            return "LOW"


# Example Testing
if __name__ == "__main__":

    engine = RevisionEngine()

    next_date = engine.get_next_revision_date(2)

    print("Next Revision Date:", next_date.strftime("%Y-%m-%d"))

    score = engine.calculate_revision_score(
        completed=8,
        scheduled=10
    )

    print("Revision Score:", score)

    priority = engine.get_revision_priority(10)

    print("Priority:", priority)