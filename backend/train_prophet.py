import os
import joblib
import pandas as pd
import re
from prophet import Prophet

# Define the model directory and ensure it exists
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def clean_filename(name):
    """Sanitize filenames by replacing special characters and multiple underscores."""
    name = name.lower().strip()  # Convert to lowercase and trim spaces
    name = name.replace("&", "and")  # Replace "&" with "and"
    name = re.sub(r"[^a-z0-9]+", "_", name)  # Replace special characters with "_"
    name = re.sub(r"__+", "_", name)  # Ensure no double underscores
    return name.strip("_")  # Remove trailing underscores

def train_and_save_models(data):
    """
    Train and save a separate model for each state and crime type.
    """
    unique_states = data["STATE/UT"].unique()
    unique_crime_types = data["Type"].unique()

    for state in unique_states:
        for crime_type in unique_crime_types:
            # Filter dataset for state and crime type
            df = data[(data["STATE/UT"] == state) & (data["Type"] == crime_type)].copy()

            if df.empty or len(df) < 5:  # Ensure at least 5 data points for training
                print(f"⚠ Skipping {state} - {crime_type}: Not enough data.")
                continue  

            # Prepare DataFrame for Prophet
            df_prophet = pd.DataFrame({
                "ds": pd.to_datetime(df["YEAR"].astype(str), errors="coerce"),  # Convert YEAR to datetime
                "y": df["Crime Rate"]
            }).dropna()  # Remove invalid dates

            if df_prophet.empty:
                print(f"⚠ Skipping {state} - {crime_type}: Invalid date values.")
                continue  

            # Train Prophet model
            model = Prophet(
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                changepoint_range=0.9,
                yearly_seasonality=True,
                interval_width=0.95
            )
            model.add_seasonality(name="custom", period=5, fourier_order=3)

            # Fit model
            try:
                model.fit(df_prophet)
            except Exception as e:
                print(f"❌ Error training model for {state} - {crime_type}: {e}")
                continue  

            # Save model with cleaned filenames
            model_filename = f"{MODEL_DIR}/prophet_{clean_filename(state)}_{clean_filename(crime_type)}.pkl"
            joblib.dump(model, model_filename)
            print(f"✅ Model saved: {model_filename}")

# ✅ Load dataset and train models
if __name__ == "__main__":
    df = pd.read_excel("data/crpas_final_2.xlsx")
    train_and_save_models(df)
