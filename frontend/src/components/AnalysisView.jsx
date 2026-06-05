import { useState,useEffect } from "react"
import axios from "axios"

const streets = [
  { label: "Torvegade", value: "Torvegade" },
  { label: "Åboulevard", value: "Åboulevard" },
  { label: "Jagtvej", value: "Jagtvej" },
  { label: "Fredensbro", value: "Fredensbro" },
  { label: "Kalvebod Brygge", value: "Kalvebod Brygge" },
  { label: "Vigerslev Allé", value: "Vigerslev Allé" },
  { label: "Dr. Louises Bro", value: "Dr. Louises Bro ( ml. Nørrebrogade og Frederiksborggade)" },
  { label: "Englandsvej", value: "Englandsvej" },
  { label: "Ellebjergvej", value: "Ellebjergvej" },
  { label: "Frederikssundsvej", value: "Frederikssundsvej" },
  { label: "Tuborgvej", value: "Tuborgvej" },
  { label: "Hareskovvej", value: "Hareskovvej" },
  { label: "Roskildevej", value: "Roskildevej" },
]

function AnalysisView(){
    const [selectedStreet, setSelectedStreet] = useState("Torvegade")
    const [streetData, setStreetData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        setLoading(true)
        axios.get(`http://localhost:8000/sensors/${encodeURIComponent(selectedStreet)}`).then(res => {
            setStreetData(res.data)
            setLoading(false)
           })
    }, [selectedStreet])
    
    if (loading) return <p>Loading...</p> 
    return(
    <div className="analysis-container">
        <div className="analysis-header">
            <h2>Cycling Analysis</h2>
            <select value={selectedStreet} 
            onChange={e => setSelectedStreet(e.target.value)}>
                {streets.map(street => (
                    <option key={street.value} value={street.value}>
                        {street.label}
                        </option>
                    ))}
                    </select>
                    </div>
                        <div className="stats-grid">
                        <div className="stat-card highlight">
                            <p>Selected street</p>
                            <h3>{streetData.street}</h3>
                        </div>
                        <div className="stat-card">
                            <p>Avg cyclists per hour</p>
                            <h3>{streetData.avg_cyclists_per_hour.toLocaleString()}</h3>
                        </div>
                        <div className="stat-card">
                            <p>Daily total</p>
                            <h3>{streetData.avg_daily_total.toLocaleString()}</h3>
                        </div>
                        <div className="stat-card">
                            <p>Cluster type</p>
                            <h3>{streetData.cluster}</h3>
                        </div>
                        </div>
                    </div>
                    )
        
}

export default AnalysisView