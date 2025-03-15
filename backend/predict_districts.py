import pandas as pd
import joblib
import os
import re
from prophet import Prophet

# Paths
DISTRICT_MODEL_DIR = "district_models"

# Clean function for filenames
def clean_filename(name):
    name = name.lower().strip().replace("&", "and")
    return re.sub(r"[^a-z0-9_]", "_", name)

# Take user input
target_year = int(input("Enter the year you want to predict crime cases for: "))
state_name = input("Enter the state: ").strip().lower()
crime_type = input("Enter the crime type: ").strip().lower()

# Find all district models for this state and crime type
district_models = [
    f for f in os.listdir(DISTRICT_MODEL_DIR)
    if f.startswith(f"prophet_{clean_filename(state_name)}_") and f.endswith(f"_{clean_filename(crime_type)}.pkl")
]

if not district_models:
    print(f"⚠️ No trained district models found for {state_name.title()} - {crime_type.upper()}")
    exit()

# Store predictions
district_predictions = []

# Predict for each district
for model_filename in district_models:
    district_name = model_filename.split("_")[2:-1]  # Extract district name from filename
    district_name = " ".join(district_name).title()

    model_path = os.path.join(DISTRICT_MODEL_DIR, model_filename)
    model = joblib.load(model_path)

    # Predict cases for the given year
    future_data = pd.DataFrame({"ds": [pd.Timestamp(f"{target_year}-12-31")]})
    forecast = model.predict(future_data)

    predicted_cases = round(forecast["yhat"].iloc[0])
    district_predictions.append((district_name, predicted_cases))

# Sort districts by predicted cases (descending order)
district_predictions.sort(key=lambda x: x[1], reverse=True)

# Display top 5 districts
print(f"\nTop 5 Districts with Highest Predicted Cases in {state_name.title()} ({target_year}):")
for i, (district, cases) in enumerate(district_predictions[:5], start=1):
    print(f"  {i}. {district}: {cases:,} cases")
