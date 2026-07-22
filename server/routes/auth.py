from flask import Blueprint, jsonify, request
from models import db, User
from extensions import mail
from flask_mail import Message
import hashlib
import uuid
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# ── REGISTER ──────────────────────────────────────────────────────────────────
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'All fields are required'}), 400

    existing = User.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    new_user = User(
        username = data['username'],
        email    = data['email'],
        password = hash_password(data['password']),
        role     = data.get('role', 'buyer')
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        'message': 'Account created successfully',
        'user':    new_user.to_dict()
    }), 201


# ── LOGIN ─────────────────────────────────────────────────────────────────────
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
        'user':    user.to_dict()
    }), 200


# ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
@auth_bp.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    data  = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'If that email is registered a reset link has been sent.'}), 200

    # Generate token with 1 hour expiry
    token  = uuid.uuid4().hex
    expiry = datetime.utcnow() + timedelta(hours=1)

    user.reset_token  = token
    user.token_expiry = expiry
    db.session.commit()

    reset_link = f"http://localhost:3000/reset-password?token={token}"

    # Try sending email
    try:
        msg = Message(
            subject    = 'Property Finder — Password Reset',
            recipients = [email],
            body       = f"""Hello {user.username},

You requested a password reset for your Property Finder account.

Click the link below to reset your password (expires in 1 hour):
{reset_link}

If you did not request this, ignore this email.

Property Finder Team
"""
        )
        mail.send(msg)
        return jsonify({'message': 'Password reset link sent to your email.'}), 200

    except Exception as e:
        print(f"Email error: {e}")
        # Demo mode — return token directly
        return jsonify({
            'message':    'Reset link generated. Configure email settings to send automatically.',
            'reset_link': reset_link,
            'token':      token
        }), 200


# ── RESET PASSWORD ────────────────────────────────────────────────────────────
@auth_bp.route('/api/reset-password', methods=['POST'])
def reset_password():
    data         = request.get_json()
    token        = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({'error': 'Invalid or expired token'}), 400

    if user.token_expiry < datetime.utcnow():
        return jsonify({'error': 'Reset token has expired. Please request a new one.'}), 400

    user.password     = hash_password(new_password)
    user.reset_token  = None
    user.token_expiry = None
    db.session.commit()

    return jsonify({'message': 'Password updated successfully. You can now sign in.'}), 200