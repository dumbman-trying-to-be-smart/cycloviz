import { useState } from 'react'
import Map, { Source, Layer, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY

const sensors = [
  { name: "Torvegade",         lat: 55.6736, lng: 12.5771, cluster: "Heavy Commuter",   color: "#185FA5", avg: 817 },
  { name: "Åboulevard",        lat: 55.6868, lng: 12.5476, cluster: "Heavy Commuter",   color: "#185FA5", avg: 388 },
  { name: "Jagtvej",           lat: 55.7000, lng: 12.5511, cluster: "Heavy Commuter",   color: "#185FA5", avg: 415 },
  { name: "Fredensbro",        lat: 55.6895, lng: 12.5561, cluster: "Heavy Commuter",   color: "#185FA5", avg: 226 },
  { name: "Kalvebod Brygge",   lat: 55.6677, lng: 12.5650, cluster: "Heavy Commuter",   color: "#185FA5", avg: 90  },
  { name: "Vigerslev Allé",    lat: 55.6629, lng: 12.5198, cluster: "Heavy Commuter",   color: "#185FA5", avg: 120 },
  { name: "Dr. Louises Bro ( ml. Nørrebrogade og Frederiksborggade)",   lat: 55.6872, lng: 12.5701, cluster: "Afternoon Peak",   color: "#0F6E56", avg: 476 },
  { name: "Englandsvej",       lat: 55.6478, lng: 12.5945, cluster: "Moderate",         color: "#EF9F27", avg: 59  },
  { name: "Ellebjergvej",      lat: 55.6558, lng: 12.5148, cluster: "Moderate",         color: "#EF9F27", avg: 75  },
  { name: "Frederikssundsvej", lat: 55.7057, lng: 12.5042, cluster: "Moderate",         color: "#EF9F27", avg: 418 },
  { name: "Tuborgvej",         lat: 55.7297, lng: 12.5680, cluster: "Low Volume",       color: "#B4B2A9", avg: 116 },
  { name: "Hareskovvej",       lat: 55.7405, lng: 12.4367, cluster: "Low Volume",       color: "#B4B2A9", avg: 80  },
  { name: "Roskildevej",       lat: 55.6687, lng: 12.4936, cluster: "Low Volume",       color: "#B4B2A9", avg: 135 },
]


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
  
  const filteredSensors = selectedCluster ==="All"
  ? sensors
  :sensors.filter(s => s.cluster === selectedCluster)
  
  const geojson = {
      type: 'FeatureCollection',
      features: filteredSensors.map(sensor => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [sensor.lng, sensor.lat]
        },
        properties: {
          name: sensor.name,
          cluster: sensor.cluster,
          avg: sensor.avg,
          color: sensor.color
        }
      }))
    }

  return (
    <Map
      initialViewState={{
        longitude: 12.5559,  // ✅ centered on Copenhagen
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
  )
}

export default MapView