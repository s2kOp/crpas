import os
import joblib
import pandas as pd
import re

def clean_filename(name):
    """Convert names to match the saved model filenames."""
    name = name.lower().strip()
    name = name.replace("&", "and")
    name = re.sub(r"[^a-z0-9_]", "_", name)
    name = re.sub(r"__+", "_", name) # Replace special characters with "_"
    return name

def predict_crime(state_name, crime_type, future_year):
    """Load a trained model and predict the crime rate."""
    # Convert inputs to match model filename format
    state_name_cleaned = clean_filename(state_name)
    crime_type_cleaned = clean_filename(crime_type)

    model_filename = f"models/prophet_{state_name_cleaned}_{crime_type_cleaned}.pkl"

    if not os.path.exists(model_filename):
        print(f"🚨 Model not found for {state_name} - {crime_type}. Please train the models first.")
        return None

    # Load trained model
    model = joblib.load(model_filename)

    # Create a DataFrame for prediction
    future_df = pd.DataFrame({"ds": [pd.to_datetime(str(future_year))]})

    # Make prediction
    forecast = model.predict(future_df)
    predicted_crime_rate = forecast["yhat"].values[0]

    print(f"📌 Predicted Crime Rate in {state_name.title()} for {crime_type.upper()} in {future_year}: {predicted_crime_rate:.2f}")
    return predicted_crime_rate

# Example: Get user input
if __name__ == "__main__":
    state = input("Enter State Name: ").strip()
    crime = input("Enter Crime Type: ").strip()
    year = int(input("Enter Year for Prediction: "))

    predict_crime(state, crime, year)
