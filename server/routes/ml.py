from flask import Blueprint, jsonify, request
import numpy as np

ml_bp = Blueprint('ml', __name__)


# ─────────────────────────────────────────────────────────────────────────────
# PRICE PREDICTION — with market context
# ─────────────────────────────────────────────────────────────────────────────
@ml_bp.route('/api/predict-price', methods=['POST'])
def get_price_prediction():
    data     = request.get_json()
    bedrooms = data.get('bedrooms', 3)
    size     = data.get('size', 100)
    location = data.get('location', 'Nairobi')

    if not all([bedrooms is not None, size, location]):
        return jsonify({'error': 'bedrooms, size and location are required'}), 400

    from ml.predictor import predict_price
    from models import Property

    predicted = predict_price(
        bedrooms = int(bedrooms),
        size     = float(size),
        location = str(location)
    )

    # ── Market context ────────────────────────────────────────────────────
    # Get all properties in the same location to compute averages
    location_props = Property.query.filter(
        Property.location.ilike(f'%{location.split(",")[0]}%')
    ).all()

    if location_props:
        prices        = [float(p.price) for p in location_props]
        avg_price     = sum(prices) / len(prices)
        min_price     = min(prices)
        max_price     = max(prices)
        total_in_area = len(prices)
    else:
        avg_price     = predicted
        min_price     = predicted
        max_price     = predicted
        total_in_area = 0

    # How far is the prediction from the local average?
    if avg_price > 0:
        diff_pct = ((predicted - avg_price) / avg_price) * 100
    else:
        diff_pct = 0

    if diff_pct <= -10:
        market_verdict = "Below market average — good value"
    elif diff_pct >= 10:
        market_verdict = "Above market average — premium pricing"
    else:
        market_verdict = "In line with market average"

    return jsonify({
        'predicted_price':   round(predicted, 2),
        'currency':          'KES',
        'bedrooms':          bedrooms,
        'size':              size,
        'location':          location,
        'market_context': {
            'average_price_in_area': round(avg_price, 2),
            'min_price_in_area':     round(min_price, 2),
            'max_price_in_area':     round(max_price, 2),
            'total_listings':        total_in_area,
            'diff_from_average_pct': round(diff_pct, 1),
            'verdict':               market_verdict
        }
    })


# ─────────────────────────────────────────────────────────────────────────────
# MARKET TRENDS
# ─────────────────────────────────────────────────────────────────────────────
@ml_bp.route('/api/market-trends', methods=['GET'])
def get_market_trends():
    from models import Property

    properties = Property.query.all()

    if not properties:
        return jsonify({'error': 'No property data available'}), 404

    prices    = [float(p.price) for p in properties]
    locations = {}
    bedrooms  = {}
    types     = {'house': 0, 'land': 0}

    # ── Per-location stats ────────────────────────────────────────────────
    for p in properties:
        loc   = (p.location or 'Unknown').split(',')[0].strip()
        price = float(p.price)

        if loc not in locations:
            locations[loc] = {'prices': [], 'count': 0}
        locations[loc]['prices'].append(price)
        locations[loc]['count'] += 1

        # Bedroom distribution
        beds = p.bedrooms or 0
        key  = 'Land' if beds == 0 else f'{min(beds, 5)}{"+" if beds >= 5 else ""} Bed'
        bedrooms[key] = bedrooms.get(key, 0) + 1

        # Type distribution
        if beds == 0:
            types['land']  += 1
        else:
            types['house'] += 1

    # ── Build location summaries ──────────────────────────────────────────
    location_stats = []
    for loc, data in locations.items():
        loc_prices = data['prices']
        location_stats.append({
            'location':     loc,
            'count':        data['count'],
            'avg_price':    round(sum(loc_prices) / len(loc_prices), 2),
            'min_price':    round(min(loc_prices), 2),
            'max_price':    round(max(loc_prices), 2),
            'median_price': round(sorted(loc_prices)[len(loc_prices)//2], 2)
        })

    # Sort by average price descending
    location_stats.sort(key=lambda x: x['avg_price'], reverse=True)

    # ── Price band distribution ───────────────────────────────────────────
    bands = {
        'Under 2M':    sum(1 for p in prices if p < 2_000_000),
        '2M - 5M':     sum(1 for p in prices if 2_000_000 <= p < 5_000_000),
        '5M - 10M':    sum(1 for p in prices if 5_000_000 <= p < 10_000_000),
        '10M - 20M':   sum(1 for p in prices if 10_000_000 <= p < 20_000_000),
        'Above 20M':   sum(1 for p in prices if p >= 20_000_000),
    }

    # ── Overall stats ─────────────────────────────────────────────────────
    sorted_prices = sorted(prices)
    n             = len(sorted_prices)
    overall = {
        'total_listings':  len(properties),
        'avg_price':       round(sum(prices) / n, 2),
        'median_price':    round(sorted_prices[n // 2], 2),
        'min_price':       round(min(prices), 2),
        'max_price':       round(max(prices), 2),
        'std_deviation':   round(float(np.std(prices)), 2)
    }

    return jsonify({
        'overall':         overall,
        'by_location':     location_stats,
        'by_bedrooms':     bedrooms,
        'by_type':         types,
        'price_bands':     bands
    })


# ─────────────────────────────────────────────────────────────────────────────
# CONTENT-BASED FILTERING — Similar Properties (Real ML)
# ─────────────────────────────────────────────────────────────────────────────
@ml_bp.route('/api/similar/<int:property_id>', methods=['GET'])
def get_similar_properties(property_id):
    from models import Property
    from sklearn.preprocessing import LabelEncoder, MinMaxScaler
    from sklearn.metrics.pairwise import cosine_similarity

    properties = Property.query.all()

    if len(properties) < 2:
        return jsonify([])

    # ── Build feature matrix ──────────────────────────────────────────────
    le     = LabelEncoder()
    locs   = [p.location or 'Unknown' for p in properties]
    le.fit(locs)

    features = []
    ids      = []

    for p in properties:
        loc_enc = le.transform([p.location or 'Unknown'])[0]
        features.append([
            float(p.bedrooms or 0),
            float(p.size     or 0),
            float(p.price),
            float(loc_enc)
        ])
        ids.append(p.property_id)

    # ── Normalise features (MinMaxScaler) ─────────────────────────────────
    scaler  = MinMaxScaler()
    X       = scaler.fit_transform(features)

    # ── Find target property index ────────────────────────────────────────
    if property_id not in ids:
        return jsonify({'error': 'Property not found'}), 404

    target_idx  = ids.index(property_id)
    target_vec  = X[target_idx].reshape(1, -1)

    # ── Compute cosine similarity ─────────────────────────────────────────
    similarities = cosine_similarity(target_vec, X)[0]

    # Pair each property with its similarity score, exclude the target
    scored = [
        (ids[i], float(similarities[i]))
        for i in range(len(ids))
        if ids[i] != property_id
    ]

    # Sort by similarity descending
    scored.sort(key=lambda x: x[1], reverse=True)
    top5 = scored[:5]

    # ── Fetch and return top 5 ────────────────────────────────────────────
    results = []
    for pid, score in top5:
        prop = Property.query.get(pid)
        if prop:
            d = prop.to_dict()
            d['similarity_score'] = round(score * 100, 1)
            results.append(d)

    return jsonify(results)


# ─────────────────────────────────────────────────────────────────────────────
# PERSONALISED RECOMMENDATIONS — Interaction-based + Content Filtering
# ─────────────────────────────────────────────────────────────────────────────
@ml_bp.route('/api/recommend', methods=['POST'])
def get_recommendations():
    data     = request.get_json()
    budget   = data.get('budget', 5000000)
    bedrooms = data.get('bedrooms', 2)
    location = data.get('location', '').strip()
    user_id  = data.get('user_id')

    from models import Property, Interaction
    from sklearn.preprocessing import LabelEncoder, MinMaxScaler
    from sklearn.metrics.pairwise import cosine_similarity

    properties = Property.query.all()
    if not properties:
        return jsonify([])

    # ── Fetch user interaction history ────────────────────────────────────
    viewed_ids     = set()
    preferred_locs = []
    preferred_beds = []
    interaction_vectors = []

    if user_id:
        interactions = Interaction.query\
            .filter_by(user_id=user_id)\
            .order_by(Interaction.timestamp.desc())\
            .limit(20).all()

        for i in interactions:
            viewed_ids.add(i.property_id)
            prop = Property.query.get(i.property_id)
            if prop:
                if prop.location:
                    preferred_locs.append(prop.location)
                if prop.bedrooms:
                    preferred_beds.append(prop.bedrooms)

    # ── Infer preferences from history ────────────────────────────────────
    preferred_loc  = max(set(preferred_locs), key=preferred_locs.count) \
                     if preferred_locs else ''
    preferred_bed  = max(set(preferred_beds), key=preferred_beds.count) \
                     if preferred_beds else bedrooms
    is_personalized = bool(user_id and (preferred_locs or preferred_beds))

    # ── Build feature matrix for content-based filtering ──────────────────
    le   = LabelEncoder()
    locs = [p.location or 'Unknown' for p in properties]
    le.fit(locs)

    features = []
    ids      = []
    for p in properties:
        loc_enc = le.transform([p.location or 'Unknown'])[0]
        features.append([
            float(p.bedrooms or 0),
            float(p.size or 0),
            float(p.price),
            float(loc_enc)
        ])
        ids.append(p.property_id)

    scaler = MinMaxScaler()
    X      = scaler.fit_transform(features)

    # ── If user has history, build a preference vector ────────────────────
    if is_personalized and viewed_ids:
        viewed_indices = [ids.index(vid) for vid in viewed_ids if vid in ids]
        if viewed_indices:
            pref_vector = np.mean([X[i] for i in viewed_indices], axis=0).reshape(1,-1)
            similarities = cosine_similarity(pref_vector, X)[0]
        else:
            similarities = np.ones(len(ids))
    else:
        similarities = np.ones(len(ids))

    # ── Score each property ───────────────────────────────────────────────
    scored = []
    for idx, p in enumerate(properties):
        score = 0
        price = float(p.price)
        prop_location = (p.location or '').lower()

        # Strict location filter if user typed one
        if location and location.lower() not in prop_location:
            continue

        # ML similarity score (0-4 points)
        score += similarities[idx] * 4

        # Budget scoring
        if price <= budget:
            score += 3
        if budget > 0 and abs(price - budget) / budget < 0.2:
            score += 2

        # Bedroom scoring
        target_beds = preferred_bed if is_personalized else bedrooms
        if p.bedrooms == target_beds:
            score += 3
        elif p.bedrooms and abs((p.bedrooms or 0) - target_beds) == 1:
            score += 1

        # Location preference from history
        if preferred_loc and preferred_loc.lower() in prop_location:
            score += 4

        # Penalise properties way over budget
        if price > budget * 1.5:
            score -= 2

        d = p.to_dict()
        d['score']        = round(float(score), 2)
        d['personalized'] = is_personalized
        d['similarity']   = round(float(similarities[idx] * 100), 1)
        scored.append(d)

    scored.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(scored[:5])