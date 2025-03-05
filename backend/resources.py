from flask import jsonify, request
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, current_user
from backend.models import User, Quiz, Question, Score, db

api = Api(prefix='/api')

# User fields
user_fields = {
    'id': fields.Integer,
    'email': fields.String,
    'username': fields.String,
    'fullname': fields.String,
    'qualification': fields.String,
}

class UserAPI(Resource):
    @auth_required('token')
    @marshal_with(user_fields)
    def get(self):
        return current_user

# Quiz fields
quiz_fields = {
    'id': fields.Integer,
    'chapter_id': fields.Integer,
    'date_of_quiz': fields.DateTime,
    'time_duration': fields.String,
    'remarks': fields.String,
}

class QuizAPI(Resource):
    @auth_required('token')
    @marshal_with(quiz_fields)
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {'message': 'Quiz not found'}, 404
        return quiz

# Question fields
question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'statement': fields.String,
    'option1': fields.String,
    'option2': fields.String,
    'option3': fields.String,
    'option4': fields.String,
    'correct_option': fields.Integer,
}

class QuestionAPI(Resource):
    @auth_required('token')
    @marshal_with(question_fields)
    def get(self, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return questions

# Score fields
score_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'user_id': fields.Integer,
    'total_scored': fields.Float,
    'total_marks': fields.Float,
    'percentage': fields.Float,
    'result_status': fields.String,
}

class ScoreAPI(Resource):
    @auth_required('token')
    @marshal_with(score_fields)
    def get(self):
        scores = Score.query.filter_by(user_id=current_user.id).all()
        return scores

# Add resources to API
api.add_resource(UserAPI, '/user')
api.add_resource(QuizAPI, '/quizzes/<int:quiz_id>')
api.add_resource(QuestionAPI, '/quizzes/<int:quiz_id>/questions')
api.add_resource(ScoreAPI, '/scores')
