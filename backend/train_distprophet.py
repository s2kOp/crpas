import pandas as pd
import os
import joblib
from prophet import Prophet
import re

# Paths
DATA_PATH = "data/district_dataset.xlsx"  # Update with your dataset path
MODEL_DIR = "district_models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Load dataset
df = pd.read_excel(DATA_PATH)

# Ensure required columns are present
required_columns = {'STATE/UT', 'DISTRICT', 'YEAR', 'Type', 'Number Of Cases'}
if not required_columns.issubset(df.columns):
    raise ValueError(f"Dataset must contain columns: {required_columns}")

# Clean function for filenames
def clean_filename(name):
    name = name.lower().strip().replace("&", "and")
    return re.sub(r"[^a-z0-9_]", "_", name)

# Train Prophet model for each (State, District, Crime_Type)
for (state, district, crime_type), group in df.groupby(["STATE/UT", "DISTRICT", "Type"]):
    if group.shape[0] < 2:  # Skip if less than 2 data points
        print(f"⚠️ Skipping {state} - {district} - {crime_type} (Not enough data)")
        continue

    print(f"Training: {state} - {district} - {crime_type}")
    
    # Prepare data for Prophet
    train_data = group[["YEAR", "Number Of Cases"]].rename(columns={"YEAR": "ds", "Number Of Cases": "y"})
    train_data["ds"] = pd.to_datetime(train_data["ds"], format="%Y")

    # Train Prophet
    model = Prophet()
    model.fit(train_data)

    # Save model
    filename = f"prophet_{clean_filename(state)}_{clean_filename(district)}_{clean_filename(crime_type)}.pkl"
    joblib.dump(model, os.path.join(MODEL_DIR, filename))

print("✅ All district models trained and saved!")
