from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ARRAY, Text

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    user_id    = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(150), nullable=False, unique=True)
    password   = db.Column(db.String(255), nullable=False)
    role       = db.Column(db.String(20), nullable=False, default='buyer')
    phone      = db.Column(db.String(20))
    bio        = db.Column(db.Text)
    avatar     = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    interactions = db.relationship('Interaction', backref='user', lazy=True)

    def to_dict(self):
        return {
            'user_id':    self.user_id,
            'username':   self.username,
            'email':      self.email,
            'role':       self.role,
            'phone':      self.phone,
            'bio':        self.bio,
            'avatar':     self.avatar,
            'created_at': str(self.created_at)
        }
class Property(db.Model):
    __tablename__ = 'properties'

    property_id = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    price       = db.Column(db.Numeric(15, 2), nullable=False)
    location    = db.Column(db.String(255))
    bedrooms    = db.Column(db.Integer)
    size        = db.Column(db.Numeric(10, 2))
    latitude    = db.Column(db.Numeric(9, 6))
    longitude   = db.Column(db.Numeric(9, 6))
    description = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    images = db.Column(ARRAY(Text))
    ownership_status = db.Column(db.String(20), default='Pending')
    # Relationship — one property has many interactions
    interactions = db.relationship('Interaction', backref='property', lazy=True)

    def to_dict(self):
        return {
            'property_id': self.property_id,
            'title':       self.title,
            'price':       float(self.price),
            'location':    self.location,
            'bedrooms':    self.bedrooms,
            'size':        float(self.size) if self.size else None,
            'latitude':    float(self.latitude) if self.latitude else None,
            'longitude':   float(self.longitude) if self.longitude else None,
            'description': self.description,
            'images': self.images or [],
            'ownership_status': self.ownership_status or 'Pending',
            'created_at':  str(self.created_at)
        }


class Interaction(db.Model):
    __tablename__ = 'interactions'

    interaction_id = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    property_id    = db.Column(db.Integer, db.ForeignKey('properties.property_id'), nullable=False)
    timestamp      = db.Column(db.DateTime, default=datetime.utcnow)
    preferences    = db.Column(db.Text)

    def to_dict(self):
        return {
            'interaction_id': self.interaction_id,
            'user_id':        self.user_id,
            'property_id':    self.property_id,
            'timestamp':      str(self.timestamp),
            'preferences':    self.preferences
        }