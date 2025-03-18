Here's your updated README with the additional feature included:  

---

# CRPAS - Crime Rate Prediction and Alert System  

## 📌 Overview  
CRPAS is a machine learning-based system that predicts crime rates using **Facebook Prophet**. The project provides insights into crime trends across Indian states, offering estimated crime rates, case numbers, and population estimates for a given **year, state, and crime type**. It also identifies the **top 5 high-crime districts** in the selected state for the given crime type and year.  

## 🎯 Features  
- **Predicts** crime rate, estimated cases, and estimated population for a selected state and crime type.  
- **Displays** the **top 5 high-crime districts** in a state for the selected crime type and year, along with the **number of cases**.  
- **Machine Learning**: Uses **Facebook Prophet** for time-series forecasting.  
- **Backend**: Flask (Python).  
- **Frontend**: React Native.  
- **APIs Used**: GNewsAPI (for crime-related news).  

## 🏗️ Tech Stack  
- **Frontend**: React Native  
- **Backend**: Flask  
- **Machine Learning**: Facebook Prophet  
- **Data**: Preprocessed crime datasets  

## 📦 Setup Instructions  

### 🔹 Backend (Flask)  
1. **Clone the repository**:  
   ```bash
   git clone https://github.com/your-repo/crpas.git
   cd crpas/backend
   ```  
2. **Create a virtual environment** (recommended):  
   ```bash
   python -m venv venv
   source venv/bin/activate  # For macOS/Linux
   venv\Scripts\activate     # For Windows
   ```  
3. **Install dependencies**:  
   ```bash
   pip install -r requirements.txt
   ```  
4. **Run the Flask server**:  
   ```bash
   python -m flask run --host=0.0.0.0 --port=5000
   ```  

### 🔹 Frontend (React Native)  
1. **Navigate to the frontend folder**:  
   ```bash
   cd ../frontend
   ```  
2. **Install dependencies**:  
   ```bash
   npm install
   ```  
3. **Start the React Native app**:  
   ```bash
   npx expo start
   ```  

## 📊 Machine Learning Model  
- **Algorithm**: Facebook Prophet (time-series forecasting).  
- **Training Data**: Historical crime data categorized by **state, district, year, and crime type**.  
- **Predictions**:  
  - Crime rate per 100,000 people.  
  - Estimated number of crime cases.  
  - Projected population for the selected year.  
  - **Top 5 high-crime districts** in the selected state for the chosen crime type, with the **number of cases**.  

## 🚀 Future Improvements  
- Improving prediction accuracy with additional features.  
- Implementing an interactive crime map visualization.  

---

Let me know if you need any more changes! 🚀
