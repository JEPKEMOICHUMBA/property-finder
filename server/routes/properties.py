from flask import Blueprint, jsonify, request, make_response, send_from_directory
from models import db, Property, Interaction
import base64
import os
import uuid

properties_bp = Blueprint('properties', __name__)


# ── OPTIONS preflight for images ─────────────────────────────────────────────
@properties_bp.route('/api/properties/<int:id>/images', methods=['OPTIONS'])
def upload_images_options(id):
    response = make_response()
    response.headers['Access-Control-Allow-Origin']  = '*'
    response.headers['Access-Control-Allow-Methods'] = 'POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept'
    return response, 200
    print(f"Upload folder: {upload_folder}")
    print(f"Folder exists: {os.path.exists(upload_folder)}")



# ── Serve uploaded images ─────────────────────────────────────────────────────
@properties_bp.route('/static/uploads/<filename>')
def uploaded_file(filename):
    upload_folder = os.path.join(
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..')),
    'static', 'uploads'
)
    return send_from_directory(upload_folder, filename)


# ── GET all properties ────────────────────────────────────────────────────────
@properties_bp.route('/api/properties', methods=['GET'])
def get_properties():
    properties = Property.query.all()
    return jsonify([p.to_dict() for p in properties])


# ── GET properties with filters ───────────────────────────────────────────────
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


# ── GET properties for map ────────────────────────────────────────────────────
@properties_bp.route('/api/properties/map', methods=['GET'])
def get_map_properties():
    properties = Property.query.filter(
        Property.latitude.isnot(None),
        Property.longitude.isnot(None)
    ).all()
    return jsonify([{
        'property_id':      p.property_id,
        'title':            p.title,
        'price':            float(p.price),
        'location':         p.location,
        'bedrooms':         p.bedrooms,
        'latitude':         float(p.latitude),
        'longitude':        float(p.longitude),
        'description':      p.description,
        'images':           getattr(p, 'images', None) or [],
        'ownership_status': p.ownership_status or 'Pending'
    } for p in properties])


# ── GET or DELETE single property ─────────────────────────────────────────────
@properties_bp.route('/api/properties/<int:id>', methods=['GET', 'DELETE'])
def get_or_delete_property(id):
    prop = Property.query.get_or_404(id)

    if request.method == 'GET':
        return jsonify(prop.to_dict())

    if request.method == 'DELETE':
        try:
            Interaction.query.filter_by(property_id=id).delete()
            db.session.delete(prop)
            db.session.commit()
            return jsonify({'message': 'Property deleted successfully', 'property_id': id}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Failed to delete property: {str(e)}'}), 500


# ── PUT update property ───────────────────────────────────────────────────────
@properties_bp.route('/api/properties/<int:id>', methods=['PUT'])
def update_property(id):
    prop = Property.query.get_or_404(id)
    data = request.get_json()

    if 'title'            in data: prop.title            = data['title']
    if 'price'            in data: prop.price            = data['price']
    if 'location'         in data: prop.location         = data['location']
    if 'bedrooms'         in data: prop.bedrooms         = data['bedrooms']
    if 'size'             in data: prop.size             = data['size']
    if 'latitude'         in data: prop.latitude         = data['latitude']
    if 'longitude'        in data: prop.longitude        = data['longitude']
    if 'description'      in data: prop.description      = data['description']
    if 'ownership_status' in data: prop.ownership_status = data['ownership_status']

    db.session.commit()
    return jsonify({'message': 'Property updated', 'property': prop.to_dict()})


# ── PUT update ownership status ───────────────────────────────────────────────
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


# ── POST create property ──────────────────────────────────────────────────────
@properties_bp.route('/api/properties', methods=['POST'])
def create_property():
    data = request.get_json()
    new_property = Property(
        title            = data['title'],
        price            = data['price'],
        location         = data.get('location'),
        bedrooms         = data.get('bedrooms', 0),
        size             = data.get('size'),
        latitude         = data.get('latitude'),
        longitude        = data.get('longitude'),
        description      = data.get('description'),
        ownership_status = data.get('ownership_status', 'Pending'),
        agent_id         = data.get('agent_id')
    )
    db.session.add(new_property)
    db.session.commit()
    return jsonify(new_property.to_dict()), 201

# ── POST upload images ────────────────────────────────────────────────────────
@properties_bp.route('/api/properties/<int:id>/images', methods=['POST'])
def upload_images(id):
    prop = Property.query.get_or_404(id)
    data = request.get_json(force=True, silent=True)

    if not data:
        return jsonify({'error': 'Invalid JSON received'}), 400

    images_b64 = data.get('images', [])
    if not images_b64:
        return jsonify({'error': 'No images provided'}), 400

    upload_folder = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'static', 'uploads'
    )
    

    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    saved_urls = list(prop.images or [])

    for img_data in images_b64:
        try:
            if ',' in img_data:
                img_data = img_data.split(',')[1]
            img_bytes = base64.b64decode(img_data)
            filename  = f"{uuid.uuid4().hex}.jpg"
            filepath  = os.path.join(upload_folder, filename)
            with open(filepath, 'wb') as f:
                f.write(img_bytes)
            saved_urls.append(f"/static/uploads/{filename}")
        except Exception as e:
            return jsonify({'error': f'Image processing failed: {str(e)}'}), 400

    prop.images = saved_urls
    db.session.commit()

    return jsonify({
        'message': f'{len(images_b64)} image(s) uploaded successfully',
        'images':  prop.images
    }), 200
    


# ── DELETE single image ───────────────────────────────────────────────────────
@properties_bp.route('/api/properties/<int:id>/images', methods=['DELETE'])
def delete_image(id):
    prop = Property.query.get_or_404(id)
    data = request.get_json(force=True, silent=True)
    url  = data.get('url') or data.get('image_url') if data else None

    if not url or url not in (prop.images or []):
        return jsonify({'error': 'Image not found'}), 404

    filepath = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        url.lstrip('/')
    )
    if os.path.exists(filepath):
        os.remove(filepath)

    prop.images = [img for img in prop.images if img != url]
    db.session.commit()
    return jsonify({'message': 'Image deleted', 'images': prop.images})


# ── POST log interaction ──────────────────────────────────────────────────────
@properties_bp.route('/api/interactions', methods=['POST'])
def log_interaction():
    data        = request.get_json()
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


# ── GET user interaction history ──────────────────────────────────────────────
@properties_bp.route('/api/interactions/user/<int:user_id>', methods=['GET'])
def get_user_interactions(user_id):
    interactions = Interaction.query\
        .filter_by(user_id=user_id)\
        .order_by(Interaction.timestamp.desc())\
        .limit(20).all()

    return jsonify([{
        'interaction_id': i.interaction_id,
        'property_id':    i.property_id,
        'preference':     i.preferences,
        'timestamp':      str(i.timestamp)
    } for i in interactions])