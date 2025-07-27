from flask_restful import Resource, fields, reqparse
from flask_security import auth_required
from backend.models import Question, db
from datetime import datetime

# Output fields (only used for documentation)
question_fields = {
    'id': fields.Integer,
    'quiz_id': fields.Integer,
    'statement': fields.String,
    'options': fields.List(fields.String),
    'correct_option': fields.Integer,
    'explanation': fields.String
}

# Input parser
question_parser = reqparse.RequestParser()
question_parser.add_argument('statement', type=str, required=True, help="Statement is required")
question_parser.add_argument('option1', type=str, required=True, help="Option1 is required")
question_parser.add_argument('option2', type=str, required=True, help="Option2 is required")
question_parser.add_argument('option3', type=str, required=False)
question_parser.add_argument('option4', type=str, required=False)
question_parser.add_argument('correct_option', type=int, required=True, help="Correct option (1-4) is required")
question_parser.add_argument('explanation', type=str, required=False)

def build_options_list(q):
    options = [q.option1, q.option2]
    if q.option3:
        options.append(q.option3)
    if q.option4:
        options.append(q.option4)
    return options

class QuestionListAPI(Resource):
    @auth_required('token')
    def get(self, subject_id, chapter_id, quiz_id):
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        if not questions:
            return {'message': 'No questions found for this quiz.'}, 404

        result = []
        for q in questions:
            result.append({
                'id': q.id,
                'quiz_id': q.quiz_id,
                'statement': q.statement,
                'options': build_options_list(q),
                'correct_option': q.correct_option,
                'explanation': q.explanation
            })

        return result, 200

    @auth_required('token')
    def post(self, subject_id, chapter_id, quiz_id):
        args = question_parser.parse_args()

        new_question = Question(
            quiz_id=quiz_id,
            statement=args['statement'],
            option1=args['option1'],
            option2=args['option2'],
            option3=args.get('option3'),
            option4=args.get('option4'),
            correct_option=args['correct_option'],
            explanation=args.get('explanation')
        )

        db.session.add(new_question)
        db.session.commit()

        return {
            'id': new_question.id,
            'quiz_id': new_question.quiz_id,
            'statement': new_question.statement,
            'options': build_options_list(new_question),
            'correct_option': new_question.correct_option,
            'explanation': new_question.explanation
        }, 201

class QuestionAPI(Resource):
    @auth_required('token')
    def get(self, subject_id, chapter_id, quiz_id, question_id):
        q = Question.query.filter_by(id=question_id, quiz_id=quiz_id).first()
        if not q:
            return {'message': 'Question not found for this quiz.'}, 404

        return {
            'id': q.id,
            'quiz_id': q.quiz_id,
            'statement': q.statement,
            'options': build_options_list(q),
            'correct_option': q.correct_option,
            'explanation': q.explanation
        }, 200

    @auth_required('token')
    def put(self, subject_id, chapter_id, quiz_id, question_id):
        args = question_parser.parse_args()
        q = Question.query.filter_by(id=question_id, quiz_id=quiz_id).first()

        if not q:
            return {'message': 'Question not found to update.'}, 404

        q.statement = args['statement']
        q.option1 = args['option1']
        q.option2 = args['option2']
        q.option3 = args.get('option3')
        q.option4 = args.get('option4')
        q.correct_option = args['correct_option']
        q.explanation = args.get('explanation')

        db.session.commit()

        return {
            'id': q.id,
            'quiz_id': q.quiz_id,
            'statement': q.statement,
            'options': build_options_list(q),
            'correct_option': q.correct_option,
            'explanation': q.explanation
        }, 200

    @auth_required('token')
    def delete(self, subject_id, chapter_id, quiz_id, question_id):
        q = Question.query.filter_by(id=question_id, quiz_id=quiz_id).first()
        if not q:
            return {'message': 'Question not found to delete.'}, 404

        db.session.delete(q)
        db.session.commit()
        return {'message': 'Question deleted successfully'}, 200
