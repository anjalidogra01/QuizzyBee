from flask_restful import Resource, reqparse, fields, marshal_with
from flask_security import auth_required
from backend.models import db, Subject

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'image_url': fields.String,
    'chapters': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String
    }))
}


subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str, required=True, help="Name is required")
subject_parser.add_argument('description', type=str, required=True, help="Description is required")
subject_parser.add_argument('image', type=str, required=False)

class SubjectListAPI(Resource):
    # @auth_required('token')
    @marshal_with(subject_fields)
    def get(self):
        # Fetch all subjects
        return Subject.query.all(), 200

    @auth_required('token')
    @marshal_with(subject_fields)
    def post(self):
       
        args = subject_parser.parse_args()

       
        new_subject = Subject(
            name=args['name'],
            description=args['description'],
            image=args['image']
        )

        
        db.session.add(new_subject)
        db.session.commit()

        
        return new_subject, 201

class SubjectAPI(Resource):
   
    @marshal_with(subject_fields)
    def get(self, subject_id):
        # Fetch the subject by ID
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        return subject, 200

    @auth_required('token')
    @marshal_with(subject_fields)
    def put(self, subject_id):
        # Fetch the subject by ID
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404

        # Get the data from the request body
        args = subject_parser.parse_args()
        subject.name = args['name']
        subject.description = args['description']
        subject.image = args['image']

        # Commit changes to the database
        db.session.commit()
        return subject, 200

    @auth_required('token')
    def delete(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404

        try:
            db.session.delete(subject)
            db.session.commit()
            return {"message": "Subject and related data deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Failed to delete subject", "error": str(e)}, 500

