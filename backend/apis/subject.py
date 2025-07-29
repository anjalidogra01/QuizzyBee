from flask_restful import Resource, fields, marshal_with
from flask_security import auth_required
from flask import request, current_app
from werkzeug.utils import secure_filename
from backend.models import db, Subject
import os

subject_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'image': fields.String,  # image filename
    'chapters': fields.List(fields.Nested({
        'id': fields.Integer,
        'name': fields.String,
        'description': fields.String
    }))
}

class SubjectListAPI(Resource):
    @marshal_with(subject_fields)
    def get(self):
        return Subject.query.all(), 200

    @auth_required('token')
    @marshal_with(subject_fields)
    def post(self):
        name = request.form.get('name')
        description = request.form.get('description')
        image_file = request.files.get('image')

        if not name or not description:
            return {"message": "Name and Description are required."}, 400

        image_filename = None
        if image_file:
            image_filename = secure_filename(image_file.filename)
            image_path = os.path.join(current_app.config['IMAGE_UPLOAD_FOLDER'], image_filename)
            image_file.save(image_path)

        new_subject = Subject(name=name, description=description, image=image_filename)
        db.session.add(new_subject)
        db.session.commit()
        return new_subject, 201

class SubjectAPI(Resource):
    @marshal_with(subject_fields)
    def get(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        return subject, 200

    @auth_required('token')
    @marshal_with(subject_fields)
    def put(self, subject_id):
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Subject not found"}, 404

        name = request.form.get('name')
        description = request.form.get('description')
        image_file = request.files.get('image')

        if not name or not description:
            return {"message": "Name and Description are required."}, 400

        subject.name = name
        subject.description = description

        if image_file:
            image_filename = secure_filename(image_file.filename)
            image_path = os.path.join(current_app.config['IMAGE_UPLOAD_FOLDER'], image_filename)
            image_file.save(image_path)
            subject.image = image_filename

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
