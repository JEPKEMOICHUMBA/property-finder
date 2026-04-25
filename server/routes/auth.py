from flask import Blueprint, jsonify, request
from models import db, User
import hashlib

auth_bp = Blueprint('auth', __name__)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# REGISTER
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'All fields are required'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hash_password(data['password']),
        role=data.get('role', 'buyer')
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Account created successfully',
        'user': new_user.to_dict()
    }), 201

# LOGIN
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user or user.password != hash_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200
    # FORGOT PASSWORD
@auth_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        # Don't reveal if email exists or not — security best practice
        return jsonify({'message': 'If that email exists, a reset link has been sent.'}), 200

    # Generate a simple reset token (hash of email + timestamp)
    import hashlib, time
    token = hashlib.sha256(f"{email}{time.time()}".encode()).hexdigest()[:20]

    # In a real system you would email this token
    # For now we store it and show it (demo purposes)
    user.password = hashlib.sha256(token.encode()).hexdigest()
    db.session.commit()

    print(f"[RESET TOKEN for {email}]: {token}")

    return jsonify({
        'message': 'Password reset successful.',
        'temp_password': token,
        'note': 'Use this temporary password to sign in, then change it in your account settings.'
    }), 200