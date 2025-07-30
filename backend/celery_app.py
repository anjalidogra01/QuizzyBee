from flask import Flask
from celery import Celery
from flask_mail import Mail
from backend.models import db
from backend.config import LocalDevelopmentConfig

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    mail.init_app(app)
    return app

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    celery.flask_app = app
    return celery

# Create Flask app and Celery instance
flask_app = create_app()
celery = make_celery(flask_app)


from celery.schedules import crontab

from celery.schedules import crontab

celery.conf.update({ 
    'CELERYBEAT_SCHEDULE': {
        'send-daily-reminders': {
            'task': 'backend.tasks.send_daily_reminders',
            'schedule': crontab(hour=23, minute=14), 
        },
        'send-monthly-reports': {
            'task': 'backend.tasks.send_monthly_report',
            'schedule': crontab(day_of_month=30, hour=23, minute=14), 
        },
    }
})


# Register tasks
from backend import tasks
