# 📁 backend/resources/score.py
from flask_restful import Resource, reqparse
from flask_security import auth_required, current_user
from datetime import datetime, timedelta
from backend.models import db, Score

# Parser for POST
score_parser = reqparse.RequestParser()
score_parser.add_argument('total_scored', type=float, required=True, help='Score is required')
score_parser.add_argument('total_marks', type=float, required=True, help='Total marks are required')
score_parser.add_argument('percentage', type=float, required=True, help='Percentage is required')
score_parser.add_argument('result_status', type=str, required=True, help='Result status is required')
score_parser.add_argument('duration_taken', type=str, required=True, help='Duration is required')

class ScoreAPI(Resource):
    @auth_required('token')
    def post(self, user_id, quiz_id):
        args = score_parser.parse_args()
        try:
            h, m, s = map(int, args['duration_taken'].split(':'))
            duration_time = (datetime.min + timedelta(hours=h, minutes=m, seconds=s)).time()
        except Exception as e:
            return {'message': f'Invalid duration format: {e}'}, 400

        new_score = Score(
            quiz_id=quiz_id,
            user_id=user_id,
            timestamp_of_attempt=datetime.utcnow(),
            total_scored=args['total_scored'],
            total_marks=args['total_marks'],
            percentage=args['percentage'],
            result_status=args['result_status'],
            duration_taken=duration_time
        )
        db.session.add(new_score)
        db.session.commit()
        return {'message': 'Score added successfully'}, 201


# NEW extended GET API to list all attempts for current logged-in user
class MyAttemptsAPI(Resource):
    @auth_required('token')
    def get(self):
        user_id = current_user.id
        attempts = Score.query.filter_by(user_id=user_id).order_by(Score.timestamp_of_attempt.desc()).all()
        
        results = []
        for attempt in attempts:
            quiz = attempt.quiz
            chapter = quiz.chapter if quiz else None
            subject = chapter.subject if chapter else None

            result = {
                'id': attempt.id,
                'quiz_id': attempt.quiz_id,
                'user_id': attempt.user_id,
                'timestamp_of_attempt': (attempt.timestamp_of_attempt + timedelta(hours=5, minutes=30)).isoformat(),

                'total_scored': attempt.total_scored,
                'total_marks': attempt.total_marks,
                'percentage': attempt.percentage,
                'result_status': attempt.result_status,
                'duration_taken': attempt.duration_taken.strftime("%H:%M:%S") if attempt.duration_taken else None,
                'subject_name': subject.name if subject else None,
                'chapter_name': chapter.name if chapter else None
            }
            results.append(result)

        return results, 200
