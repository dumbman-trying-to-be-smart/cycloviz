import { CLUSTER_STYLES } from "../clusters.js"

const navItems = ["Map", "Analysis", "Compare", "Clusters"]
// "name" is the full cluster name used in the data; "label" is the shorter text on the button
const clusters = [
  { name: "All", label: "All", color: "#888888" },
  ...Object.entries(CLUSTER_STYLES).map(([name, style]) => ({ name, label: style.short, color: style.color })),
]
function Sidebar({activeNav, setActiveNav, selectedCluster, setSelectedCluster}) {
  
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">CycloViz</h2>

      <p className="sidebar-section">Views</p>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item}
            className={activeNav === item ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveNav(item)}
          >
            {item}
          </button>
      ))}
      </div>
      <p className="sidebar-section">Filter by cluster</p>
      <div className="nav-item">
        {clusters.map(cluster => (
          <button
          key={cluster.name}
          className={selectedCluster === cluster.name ? "nav-btn active" :"nav-btn"}
          onClick={()=> setSelectedCluster(cluster.name)}
          >
             <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: cluster.color,
              marginRight: "8px"
            }}></span>
            {cluster.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Sidebar