# 📁 backend/resources/summary.py
from flask_restful import Resource
from backend.models import Quiz, Subject, Score, User
from datetime import date
from collections import defaultdict
from flask_security import current_user

class SummaryAPI(Resource):
    def get(self):
        if not current_user.is_authenticated:
            return {"error": "Unauthorized"}, 401

        if 'admin' in [role.name for role in current_user.roles]:
            return self.get_admin_summary()
        else:
            return self.get_user_summary(current_user.id)

    def get_admin_summary(self):
        today = date.today()
        quizzes = Quiz.query.all()
        subjects = Subject.query.all()
        scores = Score.query.all()

        total_quizzes = len(quizzes)
        upcoming_quizzes = sum(1 for q in quizzes if q.date_of_quiz > today)
        durations = [
            q.time_duration.hour * 60 + q.time_duration.minute
            for q in quizzes if q.time_duration
        ]
        average_duration = round(sum(durations) / len(durations), 2) if durations else 0

        quizzes_per_subject = []
        for subject in subjects:
            count = sum(len(c.quizzes) for c in subject.chapters)
            quizzes_per_subject.append({"subject": subject.name, "count": count})

        user_scores = defaultdict(list)
        for s in scores:
            user_scores[s.user_id].append(s.percentage)
        top_users = sorted([
            {
                "username": User.query.get(uid).username,
                "avg_score": round(sum(p) / len(p), 2)
            }
            for uid, p in user_scores.items()
        ], key=lambda x: x["avg_score"], reverse=True)[:5]

        pass_count = sum(1 for s in scores if s.result_status and s.result_status.lower() in ["pass", "passed"])
        fail_count = sum(1 for s in scores if s.result_status and s.result_status.lower() in ["fail", "failed"])

        recent_quizzes = sorted(quizzes, key=lambda q: q.date_of_quiz, reverse=True)[:5]
        recent = [
            {
                "date": q.date_of_quiz.isoformat(),
                "chapter": q.chapter.name,
                "subject": q.chapter.subject.name
            } for q in recent_quizzes
        ]

        subject_score_data = defaultdict(list)
        for s in scores:
            subj = s.quiz.chapter.subject.name
            subject_score_data[subj].append(s.percentage)
        avg_score_per_subject = [
            {"subject": subj, "average_score": round(sum(p) / len(p), 2)}
            for subj, p in subject_score_data.items()
        ]

        subject_pass_data = defaultdict(lambda: {"pass": 0, "total": 0})
        for s in scores:
            subj = s.quiz.chapter.subject.name
            subject_pass_data[subj]["total"] += 1
            if s.result_status and s.result_status.lower() in ["pass", "passed"]:
                subject_pass_data[subj]["pass"] += 1
        pass_rate_per_subject = [
            {
                "subject": subj,
                "pass_rate": round((data["pass"] / data["total"]) * 100, 2)
                if data["total"] > 0 else 0
            }
            for subj, data in subject_pass_data.items()
        ]

        date_attempts = defaultdict(int)
        for s in scores:
            d = s.timestamp_of_attempt.strftime("%Y-%m-%d")
            date_attempts[d] += 1
        attempts_over_time = [
            {"date": d, "count": date_attempts[d]} for d in sorted(date_attempts)
        ]

        return {
            "total_quizzes": total_quizzes,
            "upcoming_quizzes": upcoming_quizzes,
            "average_duration": average_duration,
            "quizzes_per_subject": quizzes_per_subject,
            "top_users": top_users,
            "pass_count": pass_count,
            "fail_count": fail_count,
            "recent_quizzes": recent,
            "avg_score_per_subject": avg_score_per_subject,
            "pass_rate_per_subject": pass_rate_per_subject,
            "attempts_over_time": attempts_over_time
        }

    def get_user_summary(self, user_id):
        scores = Score.query.filter_by(user_id=user_id).all()

        total_attempts = len(scores)
        avg_score = round(sum(s.percentage for s in scores) / total_attempts, 2) if total_attempts > 0 else 0
        pass_count = sum(1 for s in scores if s.result_status and s.result_status.lower() in ["pass", "passed"])
        pass_rate = round((pass_count / total_attempts) * 100, 2) if total_attempts > 0 else 0

        subject_scores = defaultdict(list)
        subject_pass_data = defaultdict(lambda: {"pass": 0, "total": 0})

        for s in scores:
            subj = s.quiz.chapter.subject.name
            subject_scores[subj].append(s.percentage)
            subject_pass_data[subj]["total"] += 1
            if s.result_status and s.result_status.lower() in ["pass", "passed"]:
                subject_pass_data[subj]["pass"] += 1

        avg_score_per_subject = [
            {"subject": subj, "average_score": round(sum(percs) / len(percs), 2)}
            for subj, percs in subject_scores.items()
        ]

        pass_rate_per_subject = [
            {
                "subject": subj,
                "pass_rate": round((data["pass"] / data["total"]) * 100, 2)
                if data["total"] > 0 else 0
            }
            for subj, data in subject_pass_data.items()
        ]

        scores_over_time = sorted([
            {"date": s.timestamp_of_attempt.strftime("%Y-%m-%d"), "score": s.percentage}
            for s in scores
        ], key=lambda x: x["date"])

        distribution_buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
        for s in scores:
            p = s.percentage
            if p <= 20:
                distribution_buckets["0-20"] += 1
            elif p <= 40:
                distribution_buckets["21-40"] += 1
            elif p <= 60:
                distribution_buckets["41-60"] += 1
            elif p <= 80:
                distribution_buckets["61-80"] += 1
            else:
                distribution_buckets["81-100"] += 1
        score_distribution = [{"range": k, "count": v} for k, v in distribution_buckets.items()]

        top_subject = max(avg_score_per_subject, key=lambda x: x["average_score"], default={})
        weak_subject = min(avg_score_per_subject, key=lambda x: x["average_score"], default={})

        subjects_need_improvement = [
            {"subject": s["subject"], "average_score": s["average_score"]}
            for s in avg_score_per_subject if s["average_score"] < 60
        ]

        return {
            "total_attempts": total_attempts,
            "avg_score": avg_score,
            "pass_rate": pass_rate,
            "avg_score_per_subject": avg_score_per_subject,
            "pass_rate_per_subject": pass_rate_per_subject,
            "scores_over_time": scores_over_time,
            "score_distribution": score_distribution,
            "top_subject": top_subject,
            "weak_subject": weak_subject,
            "subjects_need_improvement": subjects_need_improvement
        }
