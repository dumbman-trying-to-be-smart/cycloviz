import { useState,useEffect} from "react"
import axios from "axios"

const clusterGroups = [
  { name: "Balanced Commuter Routes", color: "#185FA5", bg: "#E6F1FB" },
  { name: "Afternoon-Evening Route", color: "#085041", bg: "#E6F4EE" },
  { name: "Rush-Hour Route", color: "#7A4F00", bg: "#FEF6E4" },
  { name: "Afternoon-Leaning Commuter Routes", color: "#4B3478", bg: "#EFEAF8" },
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
    return (
        <div className="spinner-container">
        <svg width="150" height="75" viewBox="0 0 150 75" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g className="w1">
            <circle cx="34" cy="56" r="20" stroke="#185FA5" strokeWidth="2"/>
            <circle cx="34" cy="56" r="14" stroke="#185FA5" strokeWidth="1" strokeDasharray="4 4"/>
            <circle cx="34" cy="56" r="3" fill="#185FA5"/>
            </g>
            <g className="w2">
            <circle cx="106" cy="56" r="20" stroke="#185FA5" strokeWidth="2"/>
            <circle cx="106" cy="56" r="14" stroke="#185FA5" strokeWidth="1" strokeDasharray="4 4"/>
            <circle cx="106" cy="56" r="3" fill="#185FA5"/>
            </g>
            <line x1="34" y1="56" x2="68" y2="56" stroke="#185FA5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="68" y1="56" x2="62" y2="30" stroke="#185FA5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="68" y1="56" x2="98" y2="32" stroke="#185FA5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="62" y1="30" x2="98" y2="32" stroke="#185FA5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="98" y1="32" x2="106" y2="56" stroke="#185FA5" strokeWidth="2" strokeLinecap="round"/>
            <line x1="62" y1="30" x2="34" y2="56" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="68" cy="56" r="3" fill="#185FA5"/>
            <line x1="62" y1="30" x2="60" y2="20" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M54 19 Q60 16 66 19" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <line x1="98" y1="32" x2="100" y2="22" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M96 20 Q100 18 106 22" stroke="#185FA5" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        </svg>
        <div className="road">
            <div className="rd"></div>
            <div className="rd"></div>
            <div className="rd"></div>
        </div>
        <div className="loading-text">Loading data</div>
        </div>
    )

    return (
  <div className="cluster-container">
    <h2>Street Clusters</h2>
    {clusterGroups.map(group => (
      <div key={group.name} className="cluster-group">
        <div className="cluster-group-header" style={{ background: group.bg, color: group.color }}>
          {group.name}
        </div>
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