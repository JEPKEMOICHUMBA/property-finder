from flask import Blueprint, jsonify, request, make_response
from models import db, Property
import base64
import os
import time
import uuid
from werkzeug.utils import secure_filename


from models import db, Property, Interaction

properties_bp = Blueprint('properties', __name__)
@properties_bp.route('/api/properties/<int:id>/images', methods=['OPTIONS'])
def upload_images_options(id):
    response = make_response()
    response.headers['Access-Control-Allow-Origin']  = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response, 200
# GET all properties
@properties_bp.route('/api/properties', methods=['GET'])
def get_properties():
    properties = Property.query.all()
    return jsonify([p.to_dict() for p in properties])

# PUT — update ownership status (admin only)
@properties_bp.route('/api/properties/<int:id>/ownership', methods=['PUT'])
def update_ownership(id):
    prop   = Property.query.get_or_404(id)
    data   = request.get_json()
    status = data.get('ownership_status')

    if status not in ['Verified', 'Pending', 'Disputed']:
        return jsonify({'error': 'Status must be Verified, Pending or Disputed'}), 400

    prop.ownership_status = status
    db.session.commit()
    return jsonify({
        'message':          'Ownership status updated',
        'property_id':      prop.property_id,
        'ownership_status': prop.ownership_status
    })

# GET properties with filters
@properties_bp.route('/api/properties/search', methods=['GET'])
def search_properties():
    location         = request.args.get('location', '')
    min_price        = request.args.get('min_price', type=float)
    max_price        = request.args.get('max_price', type=float)
    bedrooms         = request.args.get('bedrooms', type=int)
    prop_type        = request.args.get('type', '')
    ownership_status = request.args.get('ownership_status', '')

    query = Property.query

    if location:
        query = query.filter(
            Property.location.ilike(f'%{location}%') |
            Property.title.ilike(f'%{location}%')
        )
    if min_price:
        query = query.filter(Property.price >= min_price)
    if max_price:
        query = query.filter(Property.price <= max_price)
    if bedrooms is not None:
        if bedrooms == 0:
            query = query.filter(Property.bedrooms == 0)
        else:
            query = query.filter(Property.bedrooms == bedrooms)
    if prop_type == 'land':
        query = query.filter(Property.bedrooms == 0)
    elif prop_type == 'house':
        query = query.filter(Property.bedrooms > 0)
    if ownership_status:
        query = query.filter(Property.ownership_status == ownership_status)

    properties = query.order_by(Property.price.asc()).all()
    return jsonify([p.to_dict() for p in properties])

# GET properties for map ← THIS MUST COME BEFORE /<int:id>
@properties_bp.route('/api/properties/map', methods=['GET'])
def get_map_properties():
    properties = Property.query.filter(
        Property.latitude.isnot(None),
        Property.longitude.isnot(None)
    ).all()
    return jsonify([{
        'property_id': p.property_id,
        'title':       p.title,
        'price':       float(p.price),
        'location':    p.location,
        'bedrooms':    p.bedrooms,
        'latitude':    float(p.latitude),
        'longitude':   float(p.longitude),
        'description': p.description
    } for p in properties])

# GET single property by ID ← THIS COMES AFTER /map
@properties_bp.route('/api/properties/<int:id>', methods=['GET'])
def get_property(id):
    prop = Property.query.get_or_404(id)
    return jsonify(prop.to_dict())


# GET — fetch user interaction history
@properties_bp.route('/api/interactions/user/<int:user_id>', methods=['GET'])
def get_user_interactions(user_id):
    interactions = Interaction.query.filter_by(user_id=user_id)\
        .order_by(Interaction.timestamp.desc())\
        .limit(20).all()

    return jsonify([{
        'interaction_id': i.interaction_id,
        'property_id':    i.property_id,
        'preference':     i.preferences,
        'timestamp':      str(i.timestamp)
    } for i in interactions])

# POST create property
@properties_bp.route('/api/properties', methods=['POST'])
def create_property():
    data = request.get_json()
    new_property = Property(
        title       = data['title'],
        price       = data['price'],
        location    = data.get('location'),
        bedrooms    = data.get('bedrooms'),
        size        = data.get('size'),
        latitude    = data.get('latitude'),
        longitude   = data.get('longitude'),
        description = data.get('description')
    )
    db.session.add(new_property)
    db.session.commit()
    return jsonify(new_property.to_dict()), 201

# POST — upload images for a property

    
    # POST — log a user interaction
@properties_bp.route('/api/interactions', methods=['POST'])
def log_interaction():
    data = request.get_json()
    user_id     = data.get('user_id')
    property_id = data.get('property_id')
    preference  = data.get('preference', 'viewed')

    if not user_id or not property_id:
        return jsonify({'error': 'user_id and property_id required'}), 400

    interaction = Interaction(
        user_id     = user_id,
        property_id = property_id,
        preferences = preference
    )
    db.session.add(interaction)
    db.session.commit()
    return jsonify({'message': 'Interaction recorded'}), 201
    
    # DELETE — remove a specific image
@properties_bp.route('/api/properties/<int:id>/images', methods=['DELETE'])
def delete_image(id):
    prop = Property.query.get_or_404(id)
    data = request.get_json()
    url  = data.get('url')

    if not url or url not in (prop.images or []):
        return jsonify({'error': 'Image not found'}), 404

    
    # Delete file from disk
    filepath = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        url.lstrip('/')
    )
    if os.path.exists(filepath):
        os.remove(filepath)

    prop.images = [img for img in prop.images if img != url]
    db.session.commit()

    return jsonify({'message': 'Image deleted', 'images': prop.images})

# DELETE property
@properties_bp.route('/api/properties/<int:id>', methods=['DELETE'])
def delete_property(id):
    prop = Property.query.get_or_404(id)
    db.session.delete(prop)
    db.session.commit()
    return jsonify({'message': 'Property deleted'})