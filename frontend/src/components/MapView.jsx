import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

const sensors = [
  { name: "Torvegade", lat: 55.6736, lng: 12.5771, cluster: "Heavy Commuter", color: "#185FA5", avg: 817 },
  { name: "Åboulevard", lat: 55.6868, lng: 12.5476, cluster: "Heavy Commuter", color: "#185FA5", avg: 388 },
  { name: "Jagtvej", lat: 55.7000, lng: 12.5511, cluster: "Heavy Commuter", color: "#185FA5", avg: 415 },
  { name: "Fredensbro", lat: 55.6895, lng: 12.5561, cluster: "Heavy Commuter", color: "#185FA5", avg: 226 },
  { name: "Kalvebod Brygge", lat: 55.6677, lng: 12.5650, cluster: "Heavy Commuter", color: "#185FA5", avg: 90 },
  { name: "Vigerslev Allé", lat: 55.6629, lng: 12.5198, cluster: "Heavy Commuter", color: "#185FA5", avg: 120 },
  { name: "Dr. Louises Bro", lat: 55.6872, lng: 12.5701, cluster: "Afternoon Peak", color: "#0F6E56", avg: 476 },
  { name: "Englandsvej", lat: 55.6478, lng: 12.5945, cluster: "Moderate", color: "#EF9F27", avg: 59 },
  { name: "Ellebjergvej", lat: 55.6558, lng: 12.5148, cluster: "Moderate", color: "#EF9F27", avg: 75 },
  { name: "Frederikssundsvej", lat: 55.7057, lng: 12.5042, cluster: "Moderate", color: "#EF9F27", avg: 418 },
  { name: "Tuborgvej", lat: 55.7297, lng: 12.5680, cluster: "Low Volume", color: "#B4B2A9", avg: 116 },
  { name: "Hareskovvej", lat: 55.7405, lng: 12.4367, cluster: "Low Volume", color: "#B4B2A9", avg: 80 },
  { name: "Roskildevej", lat: 55.6687, lng: 12.4936, cluster: "Low Volume", color: "#B4B2A9", avg: 135 },
]

function MapView(){
    return(
       <MapContainer center={[55.6761, 12.5683]}
        zoom = {12}
        style ={{height:"100vh", width:"100%"}}
>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {sensors.map(sensor => (
            <CircleMarker 
            key={sensor.name}
            center={[sensor.lat, sensor.lng]}
            radius={10}
            fillColor={sensor.color}
            color="white"
            weight={2}
            fillOpacity={0.9}
            >
                <Popup>
                    <b>{sensor.name}</b><br/>
                    Cluster: {sensor.cluster}<br/>
                    Avg Cyclists/hr: {sensor.avg}
                </Popup>

            </CircleMarker>
        ) )

        }

       </MapContainer>
    )
}

export default MapView