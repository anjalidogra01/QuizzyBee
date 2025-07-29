from flask import Flask, send_from_directory
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore
from backend.resources import api
from backend.celery_app import make_celery
from backend.cache import cache
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail  
import os

mail = Mail()
celery = None  

def createApp():
    global celery  
    app = Flask(__name__, template_folder='frontend', static_url_path='/static', static_folder='frontend')
    CORS(app)
    app.config.from_object(LocalDevelopmentConfig)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))

    # Profile pic uploads
    PROFILE_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frontend', 'styles', 'uploads', 'profile_pics')
    os.makedirs(PROFILE_UPLOAD_FOLDER, exist_ok=True)
    app.config['PROFILE_UPLOAD_FOLDER'] = PROFILE_UPLOAD_FOLDER

    # Subject image uploads
    IMAGE_UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frontend', 'styles', 'uploads', 'images')
    os.makedirs(IMAGE_UPLOAD_FOLDER, exist_ok=True)
    app.config['IMAGE_UPLOAD_FOLDER'] = IMAGE_UPLOAD_FOLDER

    db.init_app(app)
    mail.init_app(app)
    cache.init_app(app)
    api.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore)
    app.app_context().push()

    celery = make_celery(app)


    @app.route('/uploads/profile_pics/<filename>')
    def uploaded_profile_pic(filename):
        return send_from_directory(app.config['PROFILE_UPLOAD_FOLDER'], filename)

    @app.route('/uploads/images/<filename>')
    def uploaded_subject_image(filename):
        return send_from_directory(app.config['IMAGE_UPLOAD_FOLDER'], filename)

    return app

app = createApp()
migrate = Migrate(app, db)


import backend.create_initial_data
import backend.routes
import backend.tasks

if __name__ == '__main__':
    app.run(debug=True)
