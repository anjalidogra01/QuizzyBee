from flask import Response, request
from flask_restful import Resource
from io import StringIO
import csv
from backend.models import db, User, Quiz, Score, Chapter, Subject

class UserExportAPI(Resource):
    def get(self):
        # Extract user_id from token or query params
        user_id = request.args.get('user_id')
        if not user_id:
            return {"error": "user_id is required"}, 400

        scores = Score.query.filter_by(user_id=user_id).all()
        if not scores:
            return {"message": "No quiz attempts found."}, 404

        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Quiz Title', 'Subject', 'Chapter', 'Score', 'Total', 'Percentage', 'Attempted On'])

        for score in scores:
            quiz = Quiz.query.get(score.quiz_id)
            chapter = Chapter.query.get(quiz.chapter_id)
            subject = Subject.query.get(chapter.subject_id)

            writer.writerow([
                quiz.title,
                subject.name,
                chapter.name,
                score.score,
                score.total,
                f"{round((score.score / score.total) * 100, 2)}%" if score.total else "0%",
                score.timestamp.strftime('%Y-%m-%d %H:%M')
            ])

        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype="text/csv",
            headers={"Content-Disposition": f"attachment; filename=user_{user_id}_quiz_report.csv"}
        )
