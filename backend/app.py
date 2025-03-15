from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
import re
from flask_cors import CORS
import logging
from prophet import Prophet

# Set up logging at the top of your file


# Enable CORS for all routes
app = Flask(__name__)
CORS(app)

# Add your dataset path here
df= pd.read_excel("data/crpas_final_2.xlsx")
# Model directory
MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

# Add this debug print to check loaded data
print("Available states in dataset:", df['STATE/UT'].unique())
print(df.head())


DISTRICT_MODEL_DIR = "district_models"

def clean_filename(name):
    """Convert names to safe filenames by removing special characters."""
    name = name.lower().strip()
    name = name.replace("&", "and")
    name = re.sub(r"[^a-z0-9_]", "_", name)

    return name

def load_model(state_name, crime_type):
    """Load a trained model if available."""
    filename = f"{MODEL_DIR}/prophet_{clean_filename(state_name)}_{clean_filename(crime_type)}.pkl"
    try:
        return joblib.load(filename)
    except FileNotFoundError:
        return None

def get_district_predictions(state_name, crime_type, target_year):
    try:
        # Find all district models for this state and crime type
        district_models = [
            f for f in os.listdir(DISTRICT_MODEL_DIR)
            if f.startswith(f"prophet_{clean_filename(state_name)}_") and 
            f.endswith(f"_{clean_filename(crime_type)}.pkl")
        ]



        if not district_models:
            print("No district models found")
            return []

        district_predictions = []
        
        # Predict for each district
        for model_filename in district_models:
            try:
                # Extract district name from filename
                # Remove 'prophet_state_' from start and '_crime_type.pkl' from end
                clean_state = clean_filename(state_name)
                clean_crime = clean_filename(crime_type)
                
                # Remove the prefix and suffix
                name_without_prefix = model_filename.replace(f"prophet_{clean_state}_", "",1)
                name_without_suffix = name_without_prefix.replace(f"_{clean_crime}.pkl", "",1)

                
                # Convert to proper case
                district_name = name_without_suffix.replace("_", " ").title()
                
                model_path = os.path.join(DISTRICT_MODEL_DIR, model_filename)
                model = joblib.load(model_path)

                # Predict cases for the given year
                future_data = pd.DataFrame({"ds": [pd.Timestamp(f"{target_year}-12-31")]})
                forecast = model.predict(future_data)

                predicted_cases = round(forecast["yhat"].iloc[0])
                district_predictions.append({
                    "district": district_name,
                    "cases": predicted_cases
                })
            except Exception as e:
                print(f"Error processing district model {model_filename}: {str(e)}")
                continue

        # Sort districts by predicted cases (descending order)
        district_predictions.sort(key=lambda x: x["cases"], reverse=True)
        return district_predictions[:5]  # Return top 5 districts

    except Exception as e:
        print(f"Error in district predictions: {str(e)}")
        return []

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        state_name = data['state']
        crime_type = data['crime_type']
        target_year = int(data['year'])

        # Validate year
        if not (2014 <= target_year <= 2040):
            return jsonify({'error': 'Year must be between 2014 and 2040'}), 400

        # Load model
        model = load_model(state_name, crime_type)
        if model is None:
            return jsonify({'error': f'No trained model found for {state_name.title()} - {crime_type}'}), 404

        # Get population data for the specific state
        try:
            state_data = df[df['STATE/UT'] == state_name.lower()]
            if state_data.empty:
                print(f"No data found for state: {state_name}")
                population = 1000000  # Default value
            else:
                population = float(state_data['POPULATION'].iloc[0])
                print(f"Found population for {state_name}: {population}")
        except Exception as e:
            print(f"Error getting population: {str(e)}")
            population = 1000000  # Default value
            print("Using DEFAULT VALUE")

        # Make prediction
        future_dates = pd.DataFrame({'ds': [pd.Timestamp(f"{target_year}-12-31")]})
        forecast = model.predict(future_dates)

        # Get district predictions
        top_districts = get_district_predictions(state_name, crime_type, target_year)

        response_data = {
            'state': state_name.title(),
            'crime_type': crime_type.upper(),
            'year': target_year,
            'predicted_crime_rate': float(forecast['yhat'].iloc[0]),
            'lower_bound': float(forecast['yhat_lower'].iloc[0]),
            'upper_bound': float(forecast['yhat_upper'].iloc[0]),
            'population': population,
            'top_districts': top_districts
        }
        
        return jsonify(response_data)

    except Exception as e:
        print(f"Error in predict: {str(e)}")  # Add detailed error logging
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

@app.route('/available_models', methods=['GET'])
def get_available_models():
    """List all available trained models."""
    available_models = []
    try:
        for filename in os.listdir(MODEL_DIR):
            if filename.startswith("prophet_") and filename.endswith(".pkl"):
                parts = filename.replace("prophet_", "").replace(".pkl", "").split("_")
                state = ' '.join(parts[:-1]).title()
                crime = parts[-1].upper()
                available_models.append({'state': state, 'crime_type': crime})

        return jsonify({'available_models': available_models})

    except Exception as e:
        return jsonify({'error': f'Error listing models: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Crime prediction service is running'})

@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'API is working'
    })

# Add a new debug endpoint to check state data
@app.route('/debug/states', methods=['GET'])
def debug_states():
    return jsonify({
        'states': df['STATE/UT'].unique().tolist(),
        'sample_data': df[['STATE/UT', 'POPULATION']].head().to_dict('records')
    })

@app.route('/predict/all-states', methods=['POST'])
def predict_all_states():
    try:
        data = request.get_json()
        print("Received request data:", data)  # Debug print
        
        crime_type = data['crime_type']
        target_year = int(data['year'])
        
        all_predictions = {}
        states = df['STATE/UT'].unique()
         # Debug print
        
        for state_name in states:
            try:
                # Load model for this state
                model = load_model(state_name, crime_type)
                if model:
                    # Make prediction
                    future_dates = pd.DataFrame({'ds': [pd.Timestamp(f"{target_year}-12-31")]})
                    forecast = model.predict(future_dates)
                    
                    all_predictions[state_name] = {
                        'crime_rate': float(forecast['yhat'].iloc[0]),
                        'lower_bound': float(forecast['yhat_lower'].iloc[0]),
                        'upper_bound': float(forecast['yhat_upper'].iloc[0])
                    }
                   # Debug print
            except Exception as e:
                print(f"Error predicting for state {state_name}: {str(e)}")
                continue
        
        print(f"Successfully generated predictions for {len(all_predictions)} states")
        return jsonify(all_predictions)
        
    except Exception as e:
        print(f"Error in predict_all_states: {str(e)}")
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

@app.route('/debug/state/<state_name>', methods=['GET'])
def debug_state_data(state_name):
    try:
        state_data = df[df['STATE/UT'] == state_name]
        if state_data.empty:
            return jsonify({
                'error': 'State not found',
                'available_states': df['STATE/UT'].unique().tolist()
            })
        
        return jsonify({
            'found': True,
            'state': state_name,
            'population': float(state_data['POPULATION'].iloc[0]),
            'data': state_data[['STATE/UT', 'POPULATION']].to_dict('records')[0]
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/debug/state-match/<state_name>', methods=['GET'])
def debug_state_match(state_name):
    try:
        # Get all states for comparison
        all_states = df['STATE/UT'].unique().tolist()
        
        # Exact match check
        exact_match = df[df['STATE/UT'] == state_name]
        
        # Case-insensitive match check
        case_insensitive_match = df[df['STATE/UT'].str.lower() == state_name.lower()]
        
        return jsonify({
            'requested_state': state_name,
            'all_states': all_states,
            'exact_match_found': not exact_match.empty,
            'case_insensitive_match_found': not case_insensitive_match.empty,
            'exact_match_data': exact_match[['STATE/UT', 'POPULATION']].to_dict('records') if not exact_match.empty else None,
            'case_insensitive_match_data': case_insensitive_match[['STATE/UT', 'POPULATION']].to_dict('records') if not case_insensitive_match.empty else None
        })
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/debug/district-names/<state_name>/<crime_type>', methods=['GET'])
def debug_district_names(state_name, crime_type):
    try:
        district_models = [
            f for f in os.listdir(DISTRICT_MODEL_DIR)
            if f.startswith(f"prophet_{clean_filename(state_name)}_") and 
            f.endswith(f"_{clean_filename(crime_type)}.pkl")
        ]
        
        parsed_names = []
        for filename in district_models:
            parts = filename.split('_')
            state_parts = clean_filename(state_name).split('_')
            district_parts = parts[len(state_parts) + 1:-2]
            district_name = ' '.join(district_parts).title()
            parsed_names.append({
                'filename': filename,
                'extracted_district': district_name,
                'parts': parts,
                'state_parts': state_parts,
                'district_parts': district_parts
            })
            
        return jsonify({
            'state': state_name,
            'crime_type': crime_type,
            'model_files': district_models,
            'parsed_names': parsed_names
        })
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
