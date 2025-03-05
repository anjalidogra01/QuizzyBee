from datetime import datetime
from flask import current_app as app, jsonify, render_template, request
from flask_security import auth_required, hash_password
from flask_security.utils import verify_and_update_password
from backend.models import db, Role, User

datastore = app.security.datastore

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/protected', methods=['GET'])
@auth_required()
def protected():
    return '<h1>Only accessible by authenticated users</h1>'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')

    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': "Invalid inputs"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({'message': "Invalid email"}), 404
        
    if verify_and_update_password(password, user):
        return jsonify({
            'email': user.email, 
            'role': user.roles[0].name,  # Returns "admin" or "user"
            'id': user.id, 
            'token': user.get_auth_token()
        })

    return jsonify({'message': "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    username = data.get('username')  
    fullname = data.get('fullname')  
    qualification = data.get('qualification')
    dob = data.get('dob')

    # Validate input
    if not email or not password or not username or not fullname:
        return jsonify({'message': 'All required fields must be filled'}), 400

    # 🚀 Prevent Admin Registration
    user_role = Role.query.filter_by(name="user").first()
    if not user_role:
        return jsonify({'message': 'User role does not exist in database'}), 500

    if 'admin' in data.get('role', '').lower():
        return jsonify({'message': 'Admin registration is not allowed'}), 403

    # Check if user already exists
    existing_user = datastore.find_user(email=email)
    if existing_user:
        return jsonify({'message': 'User already exists'}), 409

    try:
        new_user = datastore.create_user(
            email=email, 
            password=hash_password(password), 
            username=username,  
            fullname=fullname, 
            qualification=qualification,
            dob=datetime.strptime(dob, "%Y-%m-%d") if dob else None,
            roles=[user_role],  # Assign User Role Only
            active=True
        )
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        db.session.rollback()
        print("Error:", str(e)) 
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500
