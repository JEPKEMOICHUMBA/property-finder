import os
import numpy as np

model_path   = os.path.join(os.path.dirname(__file__), 'model.pkl')
encoder_path = os.path.join(os.path.dirname(__file__), 'encoder.pkl')

def predict_price(bedrooms: int, size: float, location: str) -> float:
    import joblib

    # Load model only when needed
    if not os.path.exists(model_path):
        raise FileNotFoundError('Model not trained yet. Run train_model.py first.')

    model   = joblib.load(model_path)
    encoder = joblib.load(encoder_path)

    known_locations = list(encoder.classes_)
    if location not in known_locations:
        location = known_locations[0]

    location_encoded = encoder.transform([location])[0]
    features         = np.array([[bedrooms, size, location_encoded]])
    predicted        = model.predict(features)[0]

    return max(0, round(float(predicted), 2))