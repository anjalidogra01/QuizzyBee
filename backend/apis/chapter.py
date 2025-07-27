from flask_restful import Resource, reqparse, fields, marshal_with
from flask_security import auth_required
from backend.models import Chapter, db

# Define response fields
chapter_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'image': fields.String,
    'subject_id': fields.Integer
}

# Request parser for creating/updating chapters
chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str, required=True, help='Name is required')
chapter_parser.add_argument('description', type=str, store_missing=False)
chapter_parser.add_argument('image', type=str, store_missing=False)

class ChapterListAPI(Resource):
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, subject_id=None):
        """Fetch chapters. If subject_id is provided, filter by subject_id."""
        query = Chapter.query
        if subject_id:
            query = query.filter_by(subject_id=subject_id)
        chapters = query.all()
        return chapters

    @auth_required('token')
    @marshal_with(chapter_fields)
    def post(self, subject_id):
        """Create a new chapter for the given subject_id."""
        args = chapter_parser.parse_args()
        new_chapter = Chapter(
            name=args['name'],
            description=args.get('description', ''),  # Default empty string if missing
            image=args.get('image', ''),  # Default empty string if missing
            subject_id=subject_id
        )
        db.session.add(new_chapter)
        db.session.commit()
        return new_chapter, 201

class ChapterAPI(Resource):
    @auth_required('token')
    @marshal_with(chapter_fields)
    def get(self, subject_id, chapter_id):
        """Fetch a single chapter by ID within the given subject_id."""
        chapter = Chapter.query.filter_by(id=chapter_id, subject_id=subject_id).first_or_404()
        return chapter

    @auth_required('token')
    @marshal_with(chapter_fields)
    def put(self, subject_id, chapter_id):
        """Update an existing chapter within the given subject_id."""
        chapter = Chapter.query.filter_by(id=chapter_id, subject_id=subject_id).first_or_404()
        args = chapter_parser.parse_args()

        # Update only if the field is provided
        chapter.name = args['name']
        chapter.description = args.get('description', chapter.description)
        chapter.image = args.get('image', chapter.image)

        db.session.commit()
        return chapter

    @auth_required('token')
    def delete(self, subject_id, chapter_id):
        chapter = Chapter.query.filter_by(id=chapter_id, subject_id=subject_id).first_or_404()

        try:
            db.session.delete(chapter)
            db.session.commit()
            return {'message': 'Chapter and related data deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': 'Failed to delete chapter', 'error': str(e)}, 500
