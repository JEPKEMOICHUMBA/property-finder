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