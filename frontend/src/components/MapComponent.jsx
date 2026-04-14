import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
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
  const center = [13.0827, 80.2707]; // Chennai default

  const drawRoute = (algo) => {
    if (!results || !results[algo]) return null;
    const routeIndices = results[algo].route;
    const path = routeIndices.map(idx => [locations[idx].lat, locations[idx].lng]);
    // Close the loop
    path.push([locations[routeIndices[0]].lat, locations[routeIndices[0]].lng]);
    
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
        <Marker key={loc.id} position={[loc.lat, loc.lng]}>
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
