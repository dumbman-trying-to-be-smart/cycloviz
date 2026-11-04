import { useState, useEffect } from 'react'
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import axios from "axios"
import { API_URL } from "../api.js"
import { clusterStyle } from "../clusters.js"

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const circleLayer = {
  id: 'sensors',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': ['get', 'color'],
    'circle-stroke-color': 'white',
    'circle-stroke-width': 2,
    'circle-opacity': 0.9
  }
}

function MapView({setActiveNav, setSelectedStreet, selectedCluster}) {
  const [hoveredSensor, setHoveredSensor] = useState(null)
  const [sensors, setSensors] = useState([])
  const [error, setError] = useState(false)

  // Positions, clusters and averages all come from the backend (/map)
  useEffect(() => {
    axios.get(`${API_URL}/map`)
      .then(res => setSensors(res.data.sensors))
      .catch(() => setError(true))
  }, [])

  const filteredSensors = selectedCluster === "All"
    ? sensors
    : sensors.filter(s => s.cluster_name === selectedCluster)

  const geojson = {
      type: 'FeatureCollection',
      features: filteredSensors.map(sensor => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [sensor.lng, sensor.lat]
        },
        properties: {
          name: sensor.road_name,
          cluster: sensor.cluster_name,
          avg: sensor.avg_cyclists_per_hour,
          color: clusterStyle(sensor.cluster_name).color
        }
      }))
    }

  return (
    <div style={{ position: 'relative' }}>
    {(error || sensors.length === 0) && (
      <div className="map-status">
        {error
          ? "Could not load sensor data. Please try again later."
          : "Loading sensors… (the server may take up to 30 seconds to wake up)"}
      </div>
    )}
    <Map
      initialViewState={{
        longitude: 12.5559,  // centered on Copenhagen
        latitude: 55.6867,
        zoom: 11
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle={`https://api.maptiler.com/maps/topo-v2/style.json?key=${MAPTILER_KEY}`}
      interactiveLayerIds={['sensors']}
      onClick={e => {
        const feature = e.features?.[0]
        if (feature) {
          setSelectedStreet(feature.properties.name)
          setActiveNav("Analysis")
        }
      }}
      onMouseEnter={e => {
        const feature = e.features?.[0]
        if (feature){
          setHoveredSensor({
            ...feature.properties,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
          })
        }
      }}
      onMouseLeave={() => setHoveredSensor(null)}
    >
      <Source id="sensors" type="geojson" data={geojson}>
        <Layer {...circleLayer} />
      </Source>

      {hoveredSensor && (
        <Popup
          longitude={hoveredSensor.longitude}
          latitude={hoveredSensor.latitude}
          anchor="bottom"
          closeButton={false}
          closeOnClick={false}
        >
          <div className="popup-name">{hoveredSensor.name}</div>
          <div className="popup-row">Cluster: {hoveredSensor.cluster}</div>
          <div className="popup-row">Avg cyclists/hr: <strong>{hoveredSensor.avg}</strong></div>
          <div className="popup-hint">Click to view full analysis →</div>
        </Popup>
      )}
    </Map>
    </div>
  )
}

export default MapView
