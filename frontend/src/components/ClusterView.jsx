import { useState,useEffect} from "react"
import axios from "axios"

const clusterGroups = [
  { name: "Heavy Commuter Routes", color: "#185FA5", bg: "#E6F1FB" },
  { name: "Afternoon Peak Route", color: "#085041", bg: "#E6F4EE" },
  { name: "Moderate Routes", color: "#7A4F00", bg: "#FEF6E4" },
  { name: "Low Volume Routes", color: "#444441", bg: "#F1EFE8" },
]

function getClusterColor(clusterName) {
  if (clusterName === "Heavy Commuter Routes") return { bg: "#E6F1FB", color: "#1B3A5C" }
  if (clusterName === "Afternoon Peak Route") return { bg: "#E6F4EE", color: "#085041" }
  if (clusterName === "Moderate Routes") return { bg: "#FEF6E4", color: "#7A4F00" }
  if (clusterName === "Low Volume Routes") return { bg: "#F1EFE8", color: "#444441" }
  return { bg: "#EAF3F8", color: "#1B3A5C" }
}



function ClustersView(){

    const [clusters, setClusters]= useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        axios.get(`https://cycloviz-backend.onrender.com/clusters`)
        .then((res) => {
            setClusters(res.data.cluster)
            setLoading(false)
        })
    },[])

    if (loading) return <p>Loading...</p>

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