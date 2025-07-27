import io
import csv
from flask_restful import Resource
from flask import make_response
from flask_security import roles_required
from backend.models import db, Score, Quiz, Chapter, Subject, User

class AdminExportAPI(Resource):
    @roles_required('admin')
    def get(self):
        try:
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['User ID', 'Fullname', 'Email', 'Quiz ID', 'Subject', 'Chapter', 'Score', 'Total Marks', 'Percentage', 'Status', 'Attempted On'])

            scores = db.session.query(Score, User, Quiz, Chapter, Subject).\
                join(User, Score.user_id == User.id).\
                join(Quiz, Score.quiz_id == Quiz.id).\
                join(Chapter, Quiz.chapter_id == Chapter.id).\
                join(Subject, Chapter.subject_id == Subject.id).all()

            for s, user, quiz, chapter, subject in scores:
                writer.writerow([
                    user.id,
                    user.fullname,
                    user.email,
                    quiz.id,
                    subject.name,
                    chapter.name,
                    s.total_scored,
                    s.total_marks,
                    s.percentage,
                    s.result_status,
                    s.timestamp_of_attempt.strftime("%Y-%m-%d %H:%M:%S") if s.timestamp_of_attempt else ''
                ])

            response = make_response(output.getvalue())
            response.headers["Content-Disposition"] = "attachment; filename=admin_quiz_report.csv"
            response.headers["Content-type"] = "text/csv"
            return response

        except Exception as e:
            db.session.rollback()
            return {'error': f'Export failed: {str(e)}'}, 500
