import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, Linking } from 'react-native';
import * as Location from 'expo-location';
import { images } from "../../constants";

const apikey = '9f297f0343b2f5f1aed78d607e0e217c';

export default function News() {
  const [news, setNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('India');

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    await Location.requestForegroundPermissionsAsync();
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert("Location permission denied. Showing national news.");
      fetchNews(city); 
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
    cordToCity(loc.coords.latitude, loc.coords.longitude);
  };

 
  const  cordToCity = async (latitude, longitude) => {
    let locationData = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (locationData.length > 0) {
      const userCity = locationData[0].city || locationData[0].region || "India";
      setCity(userCity);
      console.log(userCity);
      fetchNews(userCity);
    }
  };

 
  const fetchNews = async (locationQuery) => {
    setRefreshing(true);
    try {
      const url = `https://gnews.io/api/v4/search?q=${locationQuery}&lang=en&country=in&max=10&apikey=${apikey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        alert(`No news found for ${locationQuery}`);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      alert("Unable to fetch news. Please try again later.");
    }
    setRefreshing(false);
  };

  const onRefresh = () => {
    fetchNews(city);
  };

  const openArticle = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
    } else {
      alert("No URL available for this article");
    }
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity onPress={() => openArticle(item.url)} activeOpacity={0.7}>
      <View style={styles.newsCard}>
        <Image source={{ uri: item.image }} style={styles.newsImage} />
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <Text style={styles.newsDescription}>{item.description}</Text>
          <Text style={styles.newsDate}>{item.source.name}</Text>
          <Text style={styles.newsDate}>{item.publishedAt}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>News in {city}</Text>
      </View>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => item.title + index}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  headerContainer: {
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: 'black',
    zIndex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1c1c1e',
  },
  newsDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  newsDate: {
    fontSize: 12,
    color: '#8e8e93',
  },

});