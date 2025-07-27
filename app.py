from flask import Flask, send_from_directory
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore
from backend.resources import api
from backend.celery_app import make_celery, celery
from backend.cache import cache

import os
from flask_cors import CORS
from flask_migrate import Migrate
from flask_mail import Mail  

mail = Mail()

def createApp():
    app = Flask(__name__, template_folder='frontend', static_url_path='/static', static_folder='frontend')
    CORS(app)
    app.config.from_object(LocalDevelopmentConfig)

    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'frontend', 'styles', 'uploads', 'profile_pics')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    db.init_app(app)
    mail.init_app(app)
    cache.init_app(app)
    api.init_app(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore)
    app.app_context().push()

    make_celery(app)  # bind existing celery

    @app.route('/uploads/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

app = createApp()
migrate = Migrate(app, db)

import backend.create_initial_data
import backend.routes 
import backend.tasks

if __name__ == '__main__':
    app.run(debug=True)
