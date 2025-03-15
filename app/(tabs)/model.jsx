import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ModelScreen() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [year, setYear] = useState('');
  const router = useRouter();

  const cities = [
    {label: 'Andaman and Nicobar Islands', value: 'Andaman and Nicobar Islands'},
    {label: 'Andhra Pradesh', value: 'Andhra Pradesh'},
    {label: 'Arunachal Pradesh', value: 'Arunachal Pradesh'},
    {label: 'Assam', value: 'Assam'},
    {label: 'Bihar', value: 'Bihar'},
    {label: 'Chandigarh', value: 'Chandigarh'},
    {label: 'Chhattisgarh', value: 'Chhattisgarh'},
    {label: 'Dadra and Nagar Haveli', value: 'Dadra and Nagar Haveli'},
    {label: 'Daman and Diu', value: 'Daman and Diu'},
    {label: 'Delhi', value: 'Delhi'},
    {label: 'Goa', value: 'Goa'},
    {label: 'Gujarat', value: 'Gujarat'},
    {label: 'Haryana', value: 'Haryana'},
    {label: 'Himachal Pradesh', value: 'Himachal Pradesh'},
    {label: 'Jammu and Kashmir', value: 'Jammu and Kashmir'},
    {label: 'Jharkhand', value: 'Jharkhand'},
    {label: 'Karnataka', value: 'Karnataka'},
    {label: 'Kerala', value: 'Kerala'},
    {label: 'Lakshadweep', value: 'Lakshadweep'},
    {label: 'Madhya Pradesh', value: 'Madhya Pradesh'},
    {label: 'Maharashtra', value: 'Maharashtra'},
    {label: 'Manipur', value: 'Manipur'},
    {label: 'Meghalaya', value: 'Meghalaya'},
    {label: 'Mizoram', value: 'Mizoram'},
    {label: 'Nagaland', value: 'Nagaland'},
    {label: 'Odisha', value: 'Odisha'},
    {label: 'Puducherry', value: 'Puducherry'},
    {label: 'Punjab', value: 'Punjab'},
    {label: 'Rajasthan', value: 'Rajasthan'},
    {label: 'Sikkim', value: 'Sikkim'},
    {label: 'Tamil Nadu', value: 'Tamil Nadu'},
    {label: 'Tripura', value: 'Tripura'},
    {label: 'Uttar Pradesh', value: 'Uttar Pradesh'},
    {label: 'Uttarakhand', value: 'Uttarakhand'},
    {label: 'West Bengal', value: 'West Bengal'},
  ]
  const crimeTypes = [
    {label: 'Burglary', value: 'Burglary'},
    {label: 'Dacoity and Robbery', value: 'Dacoity and Robbery'},
    {label: 'Kidnapping and Abduction', value: 'Kidnapping and Abduction'},
    {label: 'Rape', value: 'Rape'},
    {label: 'Theft', value: 'Theft'},
    {label: 'Total Crimes Against Women', value: 'Total Crimes Against Women'},
    {label: 'Total Financial Crimes', value: 'Total Financial Crimes'},
    {label: 'Total Homicide Cases', value: 'Total Homicide Cases'},
    {label: 'Total IPC Crimes', value: 'Total IPC Crimes'},
    {label: 'Total Negligence Cases', value: 'Total Negligence Cases'},
    {label: 'Total Violent Crimes', value: 'Total Violent Crimes'}
  ]


  // In model.jsx, update handleSubmit:
  const handleSubmit = async () => {
    try {
      const response = await fetch('http://192.168.1.6:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: selectedCity,
          crime_type: selectedCrimeType,
          year: parseInt(year)
        })
      });
    
      const data = await response.json();
      console.log("API Response:", data);

      if (data) {
        router.push({
          pathname: '/prediction',
          params: {
            state: data.state,
            crimeType: data.crime_type,
            year: data.year.toString(),
            crimeRate: data.predicted_crime_rate.toString(),
            population: data.population.toString(),
            top_districts: JSON.stringify(data.top_districts)
          }
        });
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert(
        "Error",
        "Unable to generate prediction. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <SafeAreaView className="bg-black h-full ">
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Crime Prediction Model</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select a State/UT</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCity}
              onValueChange={(value) => setSelectedCity(value)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Select a State/UT..." value="" />
              {cities.map((city) => (
                <Picker.Item key={city.value} label={city.label} value={city.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Crime Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCrimeType}
              onValueChange={(value) => setSelectedCrimeType(value)}
              style={styles.picker}
              mode="dropdown"
            >
              <Picker.Item label="Select crime type..." value="" />
              {crimeTypes.map((crime) => (
                <Picker.Item key={crime.value} label={crime.label} value={crime.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Year</Text>
          <TextInput
            style={styles.textInput}
            value={year}
            onChangeText={setYear}
            placeholder="Enter year (e.g., 2024)"
            placeholderTextColor='white'
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <TouchableOpacity
          style={[
            (!selectedCity || !selectedCrimeType || !year) && styles.submitButtonDisabled
          ]}
          className='bg-secondary-200 rounded-lg p-4'
          onPress={handleSubmit}
          disabled={!selectedCity || !selectedCrimeType || !year}
        >
          <Text style={styles.submitButtonText}>Generate Prediction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    padding: 20,
    marginTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: 'white',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'black',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    fontSize: 16,
    height: 55,
  },

  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  submitButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'black',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
    minHeight: 55,
  },
  picker: {
    height: 55,
    width: '100%',
    color: 'white',
  },
});