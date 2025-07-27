# backend/tasks.py
from backend.celery_app import celery
from backend.models import db, User, Score
from flask_mail import Message
from flask import current_app, render_template_string
from datetime import datetime, timedelta

# ✅ Daily reminder task
@celery.task()
def send_daily_reminders():
    with celery.flask_app.app_context():
        mail = current_app.extensions.get('mail')
        users = User.query.all()
        for user in users:
            recent_score = Score.query.filter(
                Score.user_id == user.id,
                Score.timestamp_of_attempt >= datetime.utcnow() - timedelta(days=3)
            ).first()
            if not recent_score:
                try:
                    msg = Message(
                        subject="Reminder: New Quizzes Waiting!",
                        recipients=[user.email],
                        body=f"Hi {user.fullname or user.username},\n\n"
                             "We noticed you haven't attempted a quiz recently. "
                             "Check out new quizzes waiting for you!"
                    )
                    mail.send(msg)
                    print(f"📧 Reminder sent to {user.email}")
                except Exception as e:
                    print(f"❌ Failed to send reminder to {user.email}: {e}")
    return "Daily reminders sent."

# ✅ Monthly report task
@celery.task()
def send_monthly_report():
    with celery.flask_app.app_context():
        mail = current_app.extensions.get('mail')
        users = User.query.all()
        for user in users:
            month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            scores = Score.query.filter(
                Score.user_id == user.id,
                Score.timestamp_of_attempt >= month_start
            ).all()
            total_quizzes = len(scores)
            avg_percentage = round(
                sum([s.percentage for s in scores]) / total_quizzes, 2
            ) if total_quizzes else 0

            try:
                html_content = render_template_string("""
                <h3>Hello {{ name }} 👋</h3>
                <p>This is your monthly activity summary:</p>
                <ul>
                  <li><strong>Total quizzes attempted:</strong> {{ total_quizzes }}</li>
                  <li><strong>Average percentage:</strong> {{ avg_percentage }}%</li>
                </ul>
                <p>Keep learning with Quiz Master! 🚀</p>
                """, name=user.fullname or user.username,
                     total_quizzes=total_quizzes, avg_percentage=avg_percentage)

                msg = Message(
                    subject="Your Monthly Quiz Summary",
                    recipients=[user.email],
                    html=html_content
                )
                mail.send(msg)
                print(f"📧 Monthly report sent to {user.email}")
            except Exception as e:
                print(f"❌ Failed to send monthly report to {user.email}: {e}")
    return "Monthly reports sent."

# ✅ New quiz created notification
@celery.task()
def notify_new_quiz(quiz_title, subject_name):
    with celery.flask_app.app_context():
        mail = current_app.extensions.get('mail')
        users = User.query.all()
        for user in users:
            try:
                msg = Message(
                    subject="New Quiz Available!",
                    recipients=[user.email],
                    body=f"Hi {user.fullname or user.username},\n\n"
                         f"A new quiz '{quiz_title}' under the subject '{subject_name}' "
                         f"has been added. Check it out and keep learning!"
                )
                mail.send(msg)
                print(f"📧 New quiz notification sent to {user.email}")
            except Exception as e:
                print(f"❌ Failed to send new quiz mail to {user.email}: {e}")
    return "New quiz notifications sent."
