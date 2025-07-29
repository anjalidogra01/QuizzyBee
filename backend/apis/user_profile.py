from flask_restful import Resource, fields, marshal_with
from flask_security import auth_required, current_user
from werkzeug.utils import secure_filename
from flask import request, current_app
from backend.models import db, User
import os
from datetime import datetime

user_profile_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'fullname': fields.String,
    'qualification': fields.String,
    'dob': fields.DateTime(dt_format='iso8601'),
    'image': fields.String,
    'roles': fields.List(fields.String(attribute='name'))
}

class UserProfileAPI(Resource):
    @auth_required('token')
    @marshal_with(user_profile_fields)
    def get(self):
        if not current_user.is_authenticated:
            return {'message': 'Unauthorized'}, 401
        return current_user, 200

    @auth_required('token')
    def put(self):
        if not current_user.is_authenticated:
            return {'message': 'Unauthorized'}, 401

        user = current_user

        try:
            fullname = request.form.get('fullname')
            qualification = request.form.get('qualification')
            dob_str = request.form.get('dob')
            image = request.files.get('image')

            if image and image.filename:
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
                ext = image.filename.rsplit('.', 1)[-1].lower()
                if ext not in allowed_extensions:
                    return {'message': 'Invalid file type'}, 400

                filename = secure_filename(f"{user.id}_{image.filename}")
                upload_folder = current_app.config['PROFILE_UPLOAD_FOLDER']

                os.makedirs(upload_folder, exist_ok=True)

                if user.image:
                    old_image_path = os.path.join(upload_folder, user.image)
                    if os.path.exists(old_image_path):
                        os.remove(old_image_path)

                image.save(os.path.join(upload_folder, filename))
                user.image = filename

            if fullname:
                user.fullname = fullname
            if qualification:
                user.qualification = qualification
            if dob_str:
                try:
                    user.dob = datetime.strptime(dob_str, "%Y-%m-%d")
                except ValueError:
                    return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

            db.session.commit()
            return {'message': 'Profile updated successfully'}, 200

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Profile update failed: {str(e)}")
            return {'message': 'Internal server error'}, 500
