from celery import Celery
from flask import Flask
from flask_mail import Mail

from backend.models import db
from backend.config import LocalDevelopmentConfig  # Update as per your actual config class

def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']  # <-- fixed key here (uppercase)
    )
    celery.conf.update(app.config)
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    
    celery.Task = ContextTask
    return celery

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    Mail(app)
    return app

flask_app = create_app()
celery = make_celery(flask_app)


import backend.tasks as tasks 
