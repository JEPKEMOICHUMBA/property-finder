import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
from app import create_app
from models import Property

# Create models folder if not exists
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

# Load data from database
app = create_app()
with app.app_context():
    properties = Property.query.all()
    data = [{
        'bedrooms':  p.bedrooms or 0,
        'size':      float(p.size) if p.size else 0,
        'location':  p.location or 'Unknown',
        'price':     float(p.price)
    } for p in properties]

df = pd.DataFrame(data)
print(f"Loaded {len(df)} properties from database")
print(df)

# Encode location as numbers
le = LabelEncoder()
df['location_encoded'] = le.fit_transform(df['location'])

# Features and target
X = df[['bedrooms', 'size', 'location_encoded']]
y = df['price']

# Train model
model = LinearRegression()
model.fit(X, y)

# Evaluate
y_pred = model.predict(X)
mae = mean_absolute_error(y, y_pred)
r2  = r2_score(y, y_pred)
print(f"\nModel Performance:")
print(f"  MAE: KES {mae:,.0f}")
print(f"  R² Score: {r2:.4f}")

# Save model and encoder
model_path   = os.path.join(os.path.dirname(__file__), 'model.pkl')
encoder_path = os.path.join(os.path.dirname(__file__), 'encoder.pkl')
joblib.dump(model, model_path)
joblib.dump(le, encoder_path)

print(f"\nModel saved to {model_path}")
print(f"Encoder saved to {encoder_path}")
print("Training complete!")