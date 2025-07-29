import io
import csv
from flask_restful import Resource
from flask import make_response
from flask_security import roles_required
from backend.models import db, Score, Quiz, Chapter, Subject, User
from datetime import timedelta

class AdminExportAPI(Resource):
    @roles_required('admin')
    def get(self):
        try:
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['User ID', 'Full Name', 'Email', 'Quizzes Taken', 'Average Score', 'Average Percentage', 'Best Score', 'Last Attempted On'])

            users = db.session.query(User).all()

            for user in users:
                scores = Score.query.filter_by(user_id=user.id).all()
                if not scores:
                    continue

                quizzes_taken = len(scores)
                total_score = sum(s.total_scored for s in scores)
                avg_score = round(total_score / quizzes_taken, 2)
                avg_percentage = round(sum(s.percentage for s in scores) / quizzes_taken, 2)
                best_score = max(s.total_scored for s in scores)
                last_attempt = max(s.timestamp_of_attempt for s in scores if s.timestamp_of_attempt)

                writer.writerow([
                    user.id,
                    user.fullname,
                    user.email,
                    quizzes_taken,
                    avg_score,
                    avg_percentage,
                    best_score,
                    (last_attempt + timedelta(hours=5, minutes=30)).strftime("%Y-%m-%d %H:%M:%S") if last_attempt else ''

                ])

            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = "attachment; filename=user_quiz_summary.csv"
            response.headers["Content-type"] = "text/csv"
            return response

        except Exception as e:
            db.session.rollback()
            return {'error': f'Export failed: {str(e)}'}, 500

