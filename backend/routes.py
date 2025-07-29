from datetime import datetime
from flask import current_app as app, jsonify, render_template, request
from flask_login import current_user
from flask_security import auth_required, hash_password, verify_password
from backend.models import db, Role, User
from werkzeug.utils import secure_filename
from flask_mail import Message
import os
import re

datastore = app.security.datastore

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/protected', methods=['GET'])
@auth_required('token')
def protected():
    return jsonify({
        "message": "Access granted",
        "token": request.headers.get("Authentication-Token")
    })

@app.route('/custom-login', methods=['POST'])
def login():
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({'message': 'Invalid JSON'}), 400

    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'message': 'Missing credentials'}), 400

    user = datastore.find_user(email=email)
    if not user or not verify_password(password, user.password):
        return jsonify({'message': 'Invalid email or password'}), 401

    if not user.active:
        return jsonify({'message': 'You are blocked by admin on this platform.'}), 403

    return jsonify({
        'email': user.email,
        'role': user.roles[0].name if user.roles else None,
        'id': user.id,
        'token': user.get_auth_token()
    }), 200

@app.route('/register', methods=['POST'])
def register():
    if 'image' not in request.files:
        return jsonify({'message': 'No image part in request'}), 400

    image = request.files['image']
    email = request.form.get('email', '').strip()
    password = request.form.get('password', '').strip()
    username = request.form.get('username', '').strip()
    fullname = request.form.get('fullname', '').strip()
    qualification = request.form.get('qualification', '').strip()
    dob = request.form.get('dob', '').strip()
    role_name = request.form.get('role', 'user').lower()

    
    gmail_pattern = r'^[a-zA-Z0-9._%+-]+@gmail\.com$'
    if not re.match(gmail_pattern, email):
        return jsonify({'message': 'Only valid Gmail addresses are allowed'}), 400

    if not email or not password or not username or not fullname:
        return jsonify({'message': 'All required fields must be filled'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already taken'}), 400

    filename = None
    if image and image.filename != '':
        filename = secure_filename(image.filename)
        upload_folder = app.config['IMAGE_UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        image_path = os.path.join(upload_folder, filename)
        image.save(image_path)

    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        return jsonify({'message': 'User role does not exist in database'}), 500

    try:
        new_user = datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            fullname=fullname,
            qualification=qualification,
            dob=datetime.strptime(dob, "%Y-%m-%d") if dob else None,
            image=filename,
            roles=[user_role],
            active=True
        )
        db.session.commit()

        try:
            msg = Message(
                subject="Welcome to QuizzyBee",
                recipients=[email],
                body=f"""Hi {fullname},\n\nWelcome to QuizzyBee – your gateway to smarter quizzes and better learning!\nYour account has been created successfully.\n\nThanks for joining us!\n\n— Team QuizzyBee\nBrought to you with passion by Anjali Dogra ✨\n"""
            )
            app.extensions['mail'].send(msg)
        except Exception:
            pass

        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500

@app.route('/admin-dashboard', methods=['GET'])
@auth_required('token')
def admin_dashboard():
    return jsonify({
        'admin_details': {
            'name': current_user.fullname,
            'email': current_user.email,
            'role': current_user.roles[0].name if current_user.roles else "Admin"
        }
    }), 200
