import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create a custom Green Hub Icon (or use a Rider Icon image if available)
let HubIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = {
  greedy: '#fce303',   // Yellow
  two_opt: '#bc8cff',  // Purple
  dp: '#4ade80',       // Green
  brute: '#58a6ff'     // Blue
};

function MapEvents({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function ZoomToFit({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, map]);
  return null;
}

const MapComponent = ({ locations, onMapClick, results, selectedAlgorithms }) => {
  const [roadGeometries, setRoadGeometries] = useState({});
  const center = [13.0827, 80.2707]; // Chennai default

  // Fetch road paths when results change
  useEffect(() => {
    const fetchGeometries = async () => {
      if (!results) {
        setRoadGeometries({});
        return;
      }

      const newGeometries = {};
      const uniqueRoutes = new Set();
      
      // Identify unique routes to avoid duplicate API calls
      Object.entries(results).forEach(([algo, data]) => {
        const routeStr = data.route.join(',');
        uniqueRoutes.add(routeStr);
      });

      for (const routeStr of uniqueRoutes) {
        const routeIndices = routeStr.split(',').map(Number);
        const coords = routeIndices.map(idx => `${locations[idx].lng},${locations[idx].lat}`).join(';');
        // Add start point to end to complete the loop
        const fullCoords = `${coords};${locations[routeIndices[0]].lng},${locations[routeIndices[0]].lat}`;
        
        try {
          const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${fullCoords}?overview=full&geometries=geojson`);
          if (response.data.code === 'Ok') {
            // GeoJSON coordinates are [lng, lat], Leaflet needs [lat, lng]
            const path = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
            newGeometries[routeStr] = path;
          }
        } catch (error) {
          console.error('Error fetching road geometry:', error);
          // Fallback to straight lines if OSRM fails
          const path = routeIndices.map(idx => [locations[idx].lat, locations[idx].lng]);
          path.push([locations[routeIndices[0]].lat, locations[routeIndices[0]].lng]);
          newGeometries[routeStr] = path;
        }
      }
      setRoadGeometries(newGeometries);
    };

    fetchGeometries();
  }, [results, locations]);

  const drawRoute = (algo) => {
    if (!results || !results[algo]) return null;
    const routeStr = results[algo].route.join(',');
    const path = roadGeometries[routeStr];
    
    if (!path) return null;
    
    return (
      <Polyline
        key={algo}
        positions={path}
        color={COLORS[algo]}
        weight={algo === 'dp' || algo === 'brute' ? 4 : 2}
        opacity={selectedAlgorithms.includes(algo) ? 0.8 : 0}
        dashArray={algo === 'greedy' ? '5, 10' : '0'}
      />
    );
  };

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <MapEvents onMapClick={onMapClick} />
      
      {locations.map((loc, index) => (
        <Marker 
          key={loc.id} 
          position={[loc.lat, loc.lng]}
          icon={index === 0 ? HubIcon : DefaultIcon}
        >
          <Popup>
            <strong>{loc.name || `Location ${index + 1}`}</strong>
            <br />
            Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
          </Popup>
        </Marker>
      ))}

      {Object.keys(COLORS).map(algo => drawRoute(algo))}

      <ZoomToFit locations={locations} />
    </MapContainer>
  );
};

export default MapComponent;
export { COLORS };
