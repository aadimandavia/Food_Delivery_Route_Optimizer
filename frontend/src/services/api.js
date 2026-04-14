import axios from 'axios';

const API_BASE_URL = window.location.origin === 'http://localhost:5173' 
  ? 'http://localhost:8000' 
  : '/api';

export const optimizeRoute = async (locations) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/optimize-route`, {
      locations: locations.map((loc) => ({
        id: loc.id.toString(),
        lat: loc.lat,
        lng: loc.lng,
      })),
    });
    return response.data;
  } catch (error) {
    console.error('Error optimizing route:', error);
    throw error;
  }
};

export const sampleLocations = [
  { id: 1, lat: 13.0827, lng: 80.2707, name: "Central Station" },
  { id: 2, lat: 13.05, lng: 80.25, name: "T. Nagar" },
  { id: 3, lat: 13.0405, lng: 80.2337, name: "Adyar" },
  { id: 4, lat: 13.085, lng: 80.21, name: "Anna Nagar" },
  { id: 5, lat: 13.0033, lng: 80.2016, name: "Guindy" }
];
