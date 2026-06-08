import { useState,useEffect} from "react"
import axios from "axios"

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
        axios.get(`http://localhost:8000/clusters`)
        .then((res) => {
            setClusters(res.data.cluster)
            setLoading(false)
        })
    },[])

    if (loading) return <p>Loading...</p>

    return (
        <div className="cluster-container">
            <h2>Street Clusters</h2>
            <div className="cluster-list">
            {clusters.map(item => (
                <div key={item.road_name} className="cluster-item">
                <span className="cluster-street">{item.road_name}</span>
                <span 
  className="cluster-badge"
  style={{ background: getClusterColor(item.cluster_name).bg,
            color: getClusterColor(item.cluster_name).color
        }}
        >
        {item.cluster_name}
        </span>
                </div>
            ))}
            </div>
        </div>
)
}

export default ClustersView