import { useState,useEffect} from "react"
import axios from "axios"
import Loader from "./Loader.jsx"

const clusterGroups = [
  { name: "Balanced Commuter Routes", color: "#185FA5", bg: "#E6F1FB", description: "Morning and afternoon peaks of about equal size" },
  { name: "Afternoon-Evening Route", color: "#085041", bg: "#E6F4EE", description: "Small morning peak, large afternoon peak and busier evenings" },
  { name: "Rush-Hour Route", color: "#7A4F00", bg: "#FEF6E4", description: "Sharp peaks around 07:00 and 16:00, very little traffic at night" },
  { name: "Afternoon-Leaning Commuter Routes", color: "#4B3478", bg: "#EFEAF8", description: "Commuter pattern with a slightly larger afternoon peak" },
]

function getClusterColor(clusterName) {
  if (clusterName === "Balanced Commuter Routes") return { bg: "#E6F1FB", color: "#1B3A5C" }
  if (clusterName === "Afternoon-Evening Route") return { bg: "#E6F4EE", color: "#085041" }
  if (clusterName === "Rush-Hour Route") return { bg: "#FEF6E4", color: "#7A4F00" }
  if (clusterName === "Afternoon-Leaning Commuter Routes") return { bg: "#EFEAF8", color: "#4B3478" }
  return { bg: "#EAF3F8", color: "#1B3A5C" }
}



function ClustersView(){

    const [clusters, setClusters]= useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true)
        axios.get(`https://cycloviz-backend.onrender.com/clusters`)
        .then((res) => {
            setClusters(res.data.cluster)
            setLoading(false)
        })
        .catch(() => {
            setError(true)
            setLoading(false)
        })
    },[])

    if (error) return (
      <div className="spinner-container">
        <p style={{ fontSize: "32px" }}>🚲</p>
        <p style={{ color: "#999", fontSize: "14px" }}>Could not load data. Please try again later.</p>
      </div>
    )

    if (loading)
    return <Loader />

    return (
  <div className="cluster-container">
    <h2>Street Clusters</h2>
    <p style={{ fontSize: "13px", color: "#777", margin: "0 0 16px" }}>Streets are grouped by the shape of their daily traffic pattern (when they are busy), not by how many cyclists they carry.</p>
    {clusterGroups.map(group => (
      <div key={group.name} className="cluster-group">
        <div className="cluster-group-header" style={{ background: group.bg, color: group.color }}>
          {group.name}
        </div>
        <p style={{ fontSize: "12px", color: "#777", margin: "6px 12px" }}>{group.description}</p>
        <div className="cluster-list">
          {clusters
            .filter(item => item.cluster_name === group.name)
            .map(item => (
              <div key={item.road_name} className="cluster-item">
                <span className="cluster-street">{item.road_name}</span>
              </div>
            ))}
        </div>
      </div>
    ))}
  </div>
)
}

export default ClustersView
