from flask_restful import Resource
from flask import jsonify
from backend.models import db, User, Role, Score

class AdminUserListAPI(Resource):
    def get(self):
        users = User.query.all()
        users_list = []
        for user in users:
            role = user.roles[0].name if user.roles else 'user'
            if role == 'admin':
                continue
            users_list.append({
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'fullname': user.fullname,
                'qualification': user.qualification,
                'dob': user.dob.isoformat() if user.dob else None,
                'is_active': user.active,
                'role': role
            })
        return jsonify(users_list)


class AdminToggleUserStatusAPI(Resource):
    def put(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        user.active = not user.active
        db.session.commit()
        return {"message": "User status updated", "is_active": user.active}, 200


class AdminUserSummaryAPI(Resource):
    def get(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404

        scores = Score.query.filter_by(user_id=user_id).all()
        total_attempts = len(scores)
        average_percentage = 0
        total_passed = 0
        total_failed = 0

        attempts = []
        if total_attempts > 0:
            total_percentage = 0
            for s in scores:
                quiz_id = s.quiz.id if s.quiz else "-"
                subject_name = "-"
                chapter_name = "-"

                if s.quiz and s.quiz.chapter:
                    chapter_name = s.quiz.chapter.name or "-"
                    if s.quiz.chapter.subject:
                        subject_name = s.quiz.chapter.subject.name or "-"

                attempts.append({
                    "id": s.id,
                    "quiz_id": quiz_id,
                    "subject_name": subject_name,
                    "chapter_name": chapter_name,
                    "score": s.total_scored,
                    "total": s.total_marks,
                    "percentage": s.percentage,
                    "date": s.timestamp_of_attempt.strftime("%Y-%m-%d")
                })

                total_percentage += s.percentage
                if s.percentage >= 33:
                    total_passed += 1

            average_percentage = round(total_percentage / total_attempts, 2)
            total_failed = total_attempts - total_passed

        return jsonify({
            "total_attempts": total_attempts,
            "average_percentage": average_percentage,
            "total_passed": total_passed,
            "total_failed": total_failed,
            "attempts": attempts
        })