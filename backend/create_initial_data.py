from flask import current_app as app
from backend.models import db, Role, User
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    userdatastore.find_or_create_role(name='admin', description='superuser')
    userdatastore.find_or_create_role(name='user', description='general user')

    # 🚀 Ensure Only One Admin Exists
    existing_admin = User.query.join(User.roles).filter(Role.name == 'admin').first()

    if not existing_admin:
        userdatastore.create_user(
            email='admin@study.iitm.ac.in',
            password=hash_password('pass'),
            username='admin',
            fullname='Admin',
            roles=['admin']
        )

    db.session.commit()
  