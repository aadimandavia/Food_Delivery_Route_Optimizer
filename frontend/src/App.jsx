import React, { useState } from 'react';
import MapComponent, { COLORS } from './components/MapComponent';
import { optimizeRoute, sampleLocations } from './services/api';
import {
  MapPin,
  Navigation,
  Trash2,
  Loader2,
  Info,
  BarChart3,
  Plus,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [locations, setLocations] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAlgos, setSelectedAlgos] = useState(['greedy', 'two_opt', 'dp', 'brute']);
  const [error, setError] = useState(null);

  const handleMapClick = (latlng) => {
    if (locations.length >= 12) {
      setError("Maximum 12 nodes for performance");
      return;
    }
    const isFirst = locations.length === 0;
    const newLoc = {
      id: Date.now(),
      lat: latlng.lat,
      lng: latlng.lng,
      name: isFirst ? "🏠 Starting Hub" : `📍 Stop ${locations.length}`,
      isHub: isFirst
    };
    setLocations([...locations, newLoc]);
    setResults(null);
    setError(null);
  };

  const loadSamples = () => {
    setLocations(sampleLocations);
    setResults(null);
    setError(null);
  };

  const clearLocations = () => {
    setLocations([]);
    setResults(null);
    setError(null);
  };

  const removeLocation = (id) => {
    setLocations(locations.filter(l => l.id !== id));
    setResults(null);
  };

  const handleOptimize = async () => {
    if (locations.length < 3) {
      setError("Add at least 3 points to optimize the route.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await optimizeRoute(locations);
      setResults(data);
    } catch (err) {
      setError("Failed to optimize route. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlgo = (algo) => {
    if (selectedAlgos.includes(algo)) {
      setSelectedAlgos(selectedAlgos.filter(a => a !== algo));
    } else {
      setSelectedAlgos([...selectedAlgos, algo]);
    }
  };

  const getBestAlgo = () => {
    if (!results) return null;
    let best = null;
    let minDist = Infinity;
    Object.entries(results).forEach(([algo, data]) => {
      if (data.distance < minDist) {
        minDist = data.distance;
        best = algo;
      }
    });
    return best;
  };

  const bestAlgo = getBestAlgo();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <header>
          <h1>Route Optimizer</h1>
          <p className="subtitle">TSP Solver for Food Delivery</p>
        </header>

        <section className="controls">
          <button className="btn btn-primary" onClick={handleOptimize} disabled={loading || locations.length < 3}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
            Optimize Route
          </button>
          <button className="btn btn-secondary" onClick={loadSamples}>
            <MapPin size={18} /> Samples
          </button>
          <button className="btn btn-secondary" onClick={clearLocations}>
            <Trash2 size={18} />
          </button>
        </section>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Info size={14} /> {error}
          </motion.div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <section>
            <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Locations ({locations.length}/12)
            </h3>
            <div className="location-list">
              <AnimatePresence>
                {locations.length === 0 && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Click on the map to add delivery points...
                  </p>
                )}
                {locations.map((loc) => (
                  <motion.div 
                    key={loc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="location-item"
                    style={{ borderLeft: loc.isHub ? '3px solid var(--success)' : '1px solid var(--glass-border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: loc.isHub ? 'var(--success)' : 'var(--text-dim)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: loc.isHub ? 700 : 400 }}>{loc.name}</span>
                    </div>
                    <button className="remove-btn" onClick={() => removeLocation(loc.id)}>
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {results && (
            <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <BarChart3 size={18} color="var(--accent-color)" />
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Algorithm Comparison</h3>
              </div>

              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Distance</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results).map(([algo, data]) => (
                    <tr
                      key={algo}
                      onClick={() => toggleAlgo(algo)}
                      style={{
                        cursor: 'pointer',
                        opacity: selectedAlgos.includes(algo) ? 1 : 0.4,
                        background: selectedAlgos.includes(algo) ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: `4px solid ${COLORS[algo]}`
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 600 }}>{algo.replace('_', ' ').toUpperCase()}</div>
                        <span className={`badge ${data.type === 'Optimal' ? 'badge-optimal' : 'badge-approx'}`}>
                          {data.type}
                        </span>
                        {bestAlgo === algo && <span style={{ marginLeft: '4px', color: '#fce303' }}>🏆</span>}
                      </td>
                      <td>{data.distance} km</td>
                      <td>{data.time.toFixed(1)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.section>
          )}
        </div>

        <footer style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <p>TSP is NP-Hard. Solver uses combinatorial optimization.</p>
        </footer>
      </aside>

      <main className="main-content">
        <MapComponent
          locations={locations}
          onMapClick={handleMapClick}
          results={results}
          selectedAlgorithms={selectedAlgos}
        />

        <div className="legend">
          <h4 style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>Route Legend</h4>
          {Object.entries(COLORS).map(([algo, color]) => (
            <div
              key={algo}
              className="legend-item"
              onClick={() => toggleAlgo(algo)}
              style={{ cursor: 'pointer', opacity: selectedAlgos.includes(algo) ? 1 : 0.4 }}
            >
              <div className="legend-color" style={{ backgroundColor: color }}></div>
              <span>{algo.replace('_', ' ').toUpperCase()}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;
