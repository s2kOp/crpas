import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { statePaths } from '../constants/indiaMapData';
import { stateIds } from '../constants/indiaMapData';

const IndiaMapComponent = ({ crimeType, year, stateSelected, crimeRate }) => {
    const [allStatePredictions, setAllStatePredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const paths = statePaths();
    const windowWidth = Dimensions.get('window').width;

    useEffect(() => {
        fetchAllStatePredictions();
    }, [crimeType, year]);

    const fetchAllStatePredictions = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://192.168.1.6:5000/predict/all-states', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    crime_type: crimeType,
                    year: year
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json()
            setAllStatePredictions(data);
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getColorForRate = (rate) => {
        if (rate <= 0) return '#2ECC71';  
        if (rate <= 1) return '#2ECC71';  
        if (rate <= 5) return '#F1C40F';  
        if (rate <= 15) return '#E67E22'; 
        return '#E74C3C';                
    };

    const getStateColor = (pathId) => {
        console.log("Predictions for states:", allStatePredictions);

        const stateData = stateIds[pathId];
        if (!stateData) return {
            fill: '#435668',
            stroke: 'white',
            strokeWidth: 0.5
        };
    
        // Convert state name to match API response format
        const stateName = stateData.name.toLowerCase().trim();
        let fillColor = '#435668';
        let strokeColor = 'white';
        let strokeWidth = 0.5;
    
        // Debug logs
        console.log('Available predictions:', Object.keys(allStatePredictions || {}));
    
        // Find Andhra Pradesh color
        let andhraColor = '#435668';
        if (allStatePredictions) {
            const andhraKey = Object.keys(allStatePredictions).find(
                key => key.toLowerCase() === "andhra pradesh"
            );
    
            if (andhraKey) {
                andhraColor = getColorForRate(allStatePredictions[andhraKey].crime_rate);
            }
        }
    
        // Check if we have a prediction for this state
        if (allStatePredictions) {
            // Find matching state in predictions (case-insensitive)
            const predictionKey = Object.keys(allStatePredictions).find(
                key => normalizeStateName(key) === stateName
            );
            
    
            if (predictionKey) {
                fillColor = getColorForRate(allStatePredictions[predictionKey].crime_rate);
            }
        }
    
        // Ensure Telangana uses Andhra Pradesh's color
        if (stateName === "telengana") {
            fillColor = andhraColor;
        }
    
        // Highlight selected state
        if (stateName === stateSelected?.toLowerCase()) {
            strokeColor = '#FFD700';
            strokeWidth = 2;
        }
    
        return {
            fill: fillColor,
            stroke: strokeColor,
            strokeWidth: strokeWidth
        };
    };
    

    // Helper function to normalize state names
    const normalizeStateName = (name) => {
        return name.toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();
    };

    // Add debug output for state matching
    useEffect(() => {
        console.log('Available API State Names:', Object.keys(allStatePredictions || {}));
        
    }, [allStatePredictions]);
    

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading predictions for all states...</Text>
            </View>
        );
    }

  return (
        <View style={styles.container}>
            {/* Map */}
            <View style={styles.mapWrapper}>
                <Svg 
                    width={windowWidth * 0.9} 
                    height={windowWidth * 1.2} 
                    viewBox="0 0 950 950"
                    style={styles.map}
                >
                    {Object.entries(paths).map(([stateId, pathData]) => {
                        const styleProps = getStateColor(stateId);
                        return (
              <Path
                                key={stateId}
                                d={pathData}
                                {...styleProps}
                            />
                        );
                    })}
        </Svg>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#2ECC71' }]} />
                    <Text style={styles.legendText}>Very Low (≤ 1)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#F1C40F' }]} />
                    <Text style={styles.legendText}>Low (≤ 5)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#E67E22' }]} />
                    <Text style={styles.legendText}>High (≤ 15)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#E74C3C' }]} />
                    <Text style={styles.legendText}>Very High (> 15)</Text>
                </View>
            </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        paddingTop: 20,
    },
    mapWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    map: {
        backgroundColor: 'transparent',
    },
    infoContainer: {
        width: '100%',
        padding: 10,
        backgroundColor: '#2C3E50',
        borderRadius: 8,
        marginBottom: 10,
    },
    infoText: {
        color: 'white',
        fontSize: 16,
        marginVertical: 5,
    },
    infoLabel: {
        color: '#FFD700',
        fontWeight: 'bold',
    },
    legend: {
        width: '100%',
        padding: 10,
        backgroundColor: '#2C3E50',
        borderRadius: 8,
        marginTop: 10,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    legendColor: {
        width: 20,
        height: 20,
        marginRight: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'white',
    },
    legendText: {
        color: 'white',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 10,
        fontSize: 16,
    },
});

export default IndiaMapComponent;

