from flask import current_app as app
from backend.models import db, Role, User
from flask_security import SQLAlchemyUserDatastore, hash_password

with app.app_context():
    db.create_all()

    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    admin_role = userdatastore.find_or_create_role(name='admin', description='superuser')
    user_role = userdatastore.find_or_create_role(name='user', description='general user')

    # Find existing admin by role
    existing_admin = User.query.join(User.roles).filter(Role.name == 'admin').first()

    if existing_admin:
        existing_admin.email = 'anjalidogra2005@gmail.com'
        existing_admin.username = 'admin'
        existing_admin.password = hash_password('pass')
        existing_admin.roles = [admin_role]
    else:
        userdatastore.create_user(
            email='anjalidogra2005@gmail.com',
            password=hash_password('pass'),
            username='admin',
            fullname='Admin',
            roles=[admin_role]
        )

    db.session.commit()
