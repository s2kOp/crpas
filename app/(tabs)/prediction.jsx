import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import IndiaMapComponent from '../../components/IndiaMap';

export default function PredictionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log("Received params:", params);

  const predictionData = useMemo(() => {
    try {
      if (!params.crimeRate) {
        console.log("No crime rate in params");
        return null;
      }

      const crimeRate = parseFloat(params.crimeRate);
      const year = parseInt(params.year, 10);
      const basePopulation = parseFloat(params.population);
      
      console.log("Calculating with:", { crimeRate, year, basePopulation });

      const year_diff = year - 2011;
      const estimatedPopulation = Math.round(basePopulation + (0.01 * year_diff * basePopulation));
      const estimatedCases = Math.ceil(crimeRate * estimatedPopulation);

      let crimeStatus = '';
      if (crimeRate <= 1) {
        crimeStatus = 'Very Low Crime Area';
      } else if (crimeRate <= 5) {
        crimeStatus = 'Low Crime Area';
      } else if (crimeRate <= 15) {
        crimeStatus = 'High Crime Area';
      } else {
        crimeStatus = 'Very High Crime Area';
      }

      const result = {
        state: params.state,
        crimeType: params.crimeType,
        year: year,
        crimeRate: crimeRate,
        estimatedCases: estimatedCases,
        estimatedPopulation: estimatedPopulation,
        crimeStatus: crimeStatus,
        top_districts: JSON.parse(params.top_districts || '[]')
      };

      console.log("Calculated new prediction:", result);
      return result;

    } catch (error) {
      console.error("Error calculating prediction:", error);
      return null;
    }
  }, [params.state, params.crimeType, params.year, params.crimeRate, params.population, params.top_districts]); // Dependencies array

  return (
    <SafeAreaView className="bg-black h-full">
        <View style={styles.mainContainer}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.contentContainer}>
                    <View style={styles.infoContainer}>
                        <Text style={styles.title}>Crime Prediction Results</Text>

                        {predictionData ? (
                            <>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>State: </Text>
                                    {predictionData.state}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>Crime Type: </Text>
                                    {predictionData.crimeType}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>Year: </Text>
                                    {predictionData.year}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>Crime Rate: </Text>
                                    {predictionData.crimeRate.toFixed(2)}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>Estimated Cases: </Text>
                                    {predictionData.estimatedCases.toLocaleString()}
                                </Text>
                                <Text style={styles.infoText}>
                                    <Text style={styles.label}>Estimated Population: </Text>
                                    {predictionData.estimatedPopulation.toFixed(2).toLocaleString()}
                                </Text>
                                <Text style={[styles.infoText, { color: getCrimeStatusColor(predictionData.crimeStatus) }]}>
                                    <Text style={styles.label}>Crime Status: </Text>
                                    {predictionData.crimeStatus}
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.errorText}>
                                Unable to calculate prediction. Please try again.
                            </Text>
                        )}
                    </View>

                    {predictionData && predictionData.top_districts && (
                        <View style={styles.districtContainer}>
                            <Text style={styles.subTitle}>Top 5 Districts with Highest Predicted Cases</Text>
                            {predictionData.top_districts.map((district, index) => (
                                <Text key={index} style={styles.districtText}>
                                    <Text style={styles.label}>{index + 1}. {district.district}: </Text>
                                    {district.cases.toLocaleString()} cases
                                </Text>
                            ))}
                        </View>
                    )}

                    {/* Map Section */}
                    {predictionData && (
                        <View style={styles.mapSection}>
                            <View style={styles.mapWrapper}>
                                <Text style={styles.subTitle}>Crime Rate Distribution</Text>
                                <View style={styles.mapContainer}>
                                    <IndiaMapComponent 
                                        crimeType={predictionData.crimeType}
                                        year={predictionData.year}
                                        stateSelected={predictionData.state}
                                        crimeRate={predictionData.crimeRate}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Fixed button at bottom */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    className='bg-secondary-200 rounded-lg p-4' 
                    onPress={() => router.back()} 
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Make Another Prediction</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>
  );
}

// Function to change text color based on crime status
const getCrimeStatusColor = (status) => {
  switch (status) {
    case 'Very Low Crime Area': return '#2ECC71'; // Green
    case 'Low Crime Area': return '#F1C40F'; // Yellow
    case 'High Crime Area': return '#E67E22'; // Orange
    case 'Very High Crime Area': return '#E74C3C'; // Red
    default: return 'white';
  }
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: 'black',
        marginBottom: 70, // Add space for the fixed button
    },
    contentContainer: {
        flex: 1,
    },
    infoContainer: {
        padding: 20,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 8,
        left: 4,
        right: 4,
        padding: 10,
        backgroundColor: 'orange',
        borderTopWidth: 1,
        borderTopColor: '#444',
    },
    button: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        backgroundColor: 'orange',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 15,
    },
    infoText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 8,
    },
    label: {
        fontWeight: 'bold',
        color: '#FFD700',
    },
    mapSection: {
        marginTop: 20,
        width: '100%',
    },
    mapWrapper: {
        marginHorizontal: 10,  // Match district box padding
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 15,          // Match district box padding
        marginBottom: 15,     // Match district box margin
    },
    mapContainer: {
        height: 600,
        width: '100%',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    districtContainer: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        marginHorizontal: 10,
    },
    subTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFD700',
        marginBottom: 10,
        textAlign: 'center',
    },
    districtText: {
        fontSize: 16,
        color: 'white',
        marginVertical: 5,
    },
});

