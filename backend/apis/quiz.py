import traceback
import logging
from flask_restful import Resource, reqparse, fields, marshal
from flask_security import auth_required
from backend.models import Quiz, Chapter, Subject, db
from backend.tasks import notify_new_quiz
from datetime import datetime, time

logger = logging.getLogger(__name__)

def time_to_minutes(value):
    if isinstance(value, time):
        return value.hour * 60 + value.minute
    return 0


quiz_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'chapter_id': fields.Integer,
    'date_of_quiz': fields.String,
    'start_time': fields.String(attribute=lambda q: q.start_time.strftime('%H:%M') if q.start_time else None),
    'time_duration': fields.Raw(attribute=lambda q: time_to_minutes(q.time_duration)),
    'remarks': fields.String
}

# ✅ Updated: Require 'name' field in input
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('name', type=str, required=True, help='Quiz name is required')
quiz_parser.add_argument('date_of_quiz', type=str, required=True, help='Date of quiz is required')
quiz_parser.add_argument('start_time', type=str, required=True, help='Start time is required (HH:MM)')
quiz_parser.add_argument('time_duration', type=str, required=True, help='Time duration is required (in minutes)')
quiz_parser.add_argument('remarks', type=str, store_missing=False)

class QuizListAPI(Resource):
    def get(self, subject_id, chapter_id):
        try:
            logger.info(f"Fetching quizzes for Subject ID: {subject_id}, Chapter ID: {chapter_id}")
            quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
            if not quizzes:
                return {'message': 'No quizzes found'}, 200
            return marshal(quizzes, quiz_fields), 200
        except Exception as e:
            logger.error("Error in GET /quizzes: %s", str(e))
            traceback.print_exc()
            return {'message': 'Failed to fetch quizzes', 'error': str(e)}, 500

    @auth_required('token')
    def post(self, subject_id, chapter_id):
        args = quiz_parser.parse_args()
        try:
            minutes = int(args['time_duration'])
            start_time = datetime.strptime(args['start_time'], "%H:%M").time()
            new_quiz = Quiz(
                name=args['name'],
                chapter_id=chapter_id,
                date_of_quiz=datetime.strptime(args['date_of_quiz'], "%Y-%m-%d").date(),
                start_time=start_time,
                time_duration=time(hour=minutes // 60, minute=minutes % 60),
                remarks=args.get('remarks', '')
            )
            db.session.add(new_quiz)
            db.session.commit()

            # ✅ Notify with quiz name
            chapter = Chapter.query.get(chapter_id)
            subject = Subject.query.get(subject_id)
            notify_new_quiz.delay(
                f"New Quiz: {new_quiz.name} on {args['date_of_quiz']}",
                subject.name if subject else "Unknown Subject"
            )

            return marshal(new_quiz, quiz_fields), 201
        except Exception as e:
            db.session.rollback()
            logger.error("Error in POST /quizzes: %s", str(e))
            traceback.print_exc()
            return {'message': 'Failed to create quiz', 'error': str(e)}, 500

class QuizAPI(Resource):
    @auth_required('token')
    def get(self, subject_id, chapter_id, quiz_id):
        quiz = Quiz.query.filter_by(id=quiz_id, chapter_id=chapter_id).first()
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        return marshal(quiz, quiz_fields), 200

    @auth_required('token')
    def put(self, subject_id, chapter_id, quiz_id):
        quiz = Quiz.query.filter_by(id=quiz_id, chapter_id=chapter_id).first()
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        
        args = quiz_parser.parse_args()
        try:
            minutes = int(args['time_duration'])
            quiz.name = args['name']
            quiz.date_of_quiz = datetime.strptime(args['date_of_quiz'], "%Y-%m-%d").date()
            quiz.start_time = datetime.strptime(args['start_time'], "%H:%M").time()
            quiz.time_duration = time(hour=minutes // 60, minute=minutes % 60)
            quiz.remarks = args.get('remarks', quiz.remarks)
            db.session.commit()
            return marshal(quiz, quiz_fields), 200
        except Exception as e:
            db.session.rollback()
            logger.error("Error in PUT /quizzes: %s", str(e))
            traceback.print_exc()
            return {'message': 'Failed to update quiz', 'error': str(e)}, 500

    @auth_required('token')
    def delete(self, subject_id, chapter_id, quiz_id):
        quiz = Quiz.query.filter_by(id=quiz_id, chapter_id=chapter_id).first()
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        try:
            db.session.delete(quiz)
            db.session.commit()
            return {'message': 'Quiz deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            logger.error("Error in DELETE /quizzes: %s", str(e))
            traceback.print_exc()
            return {'message': 'Failed to delete quiz', 'error': str(e)}, 500
