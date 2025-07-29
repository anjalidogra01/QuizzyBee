from flask_restful import Api
from backend.apis.subject import SubjectAPI, SubjectListAPI
from backend.apis.chapter import ChapterAPI, ChapterListAPI
from backend.apis.quiz import QuizAPI, QuizListAPI
from backend.apis.question import QuestionAPI, QuestionListAPI
from backend.apis.score import ScoreAPI
from backend.apis.user_profile import UserProfileAPI
from backend.apis.summary import SummaryAPI
from backend.apis.score import ScoreAPI, MyAttemptsAPI
from backend.apis.user_list import AdminUserListAPI, AdminToggleUserStatusAPI, AdminUserSummaryAPI
from backend.apis.export import AdminExportAPI

api = Api()

# Subjects APIs
api.add_resource(SubjectListAPI, '/api/subjects')  
api.add_resource(SubjectAPI, '/api/subjects/<int:subject_id>')

# Chapters APIs (linked to subjects)
api.add_resource(ChapterListAPI, '/api/subjects/<int:subject_id>/chapters')  
api.add_resource(ChapterAPI, '/api/subjects/<int:subject_id>/chapters/<int:chapter_id>')  

# Quizzes APIs (linked to chapters)
api.add_resource(QuizListAPI, '/api/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes')  
api.add_resource(QuizAPI, '/api/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>')  

# Questions APIs (linked to quizzes)
api.add_resource(QuestionListAPI, '/api/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>/questions')  
api.add_resource(QuestionAPI, '/api/subjects/<int:subject_id>/chapters/<int:chapter_id>/quizzes/<int:quiz_id>/questions/<int:question_id>')  

# Scores API (linked to users, subjects, chapters, and quizzes)

api.add_resource(ScoreAPI, '/api/scores/<int:user_id>/<int:quiz_id>')
api.add_resource(MyAttemptsAPI, '/api/scores')

# userProfile
api.add_resource(UserProfileAPI, '/api/user/profile')

api.add_resource(SummaryAPI, '/api/summary')



api.add_resource(AdminUserListAPI, "/api/admin/users")
api.add_resource(AdminToggleUserStatusAPI, "/api/admin/users/<int:user_id>/toggle")
api.add_resource(AdminUserSummaryAPI, '/api/admin/user/<int:user_id>/summary')
api.add_resource(AdminExportAPI, "/api/admin/export")


