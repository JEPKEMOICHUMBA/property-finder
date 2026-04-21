from flask import Blueprint, jsonify, request
from models import db, User
import hashlib
import base64
import os

users_bp = Blueprint('users', __name__)

# GET single user
@users_bp.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user.to_dict())

# UPDATE user profile
@users_bp.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.get_json()

    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.user_id != id:
            return jsonify({'error': 'Email already in use'}), 409
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    if 'bio' in data:
        user.bio = data['bio']
    if 'avatar' in data:
        user.avatar = data['avatar']
    if 'password' in data and data['password']:
        user.password = hashlib.sha256(data['password'].encode()).hexdigest()

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()})