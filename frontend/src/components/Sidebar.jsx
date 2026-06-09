import { useState } from "react"

const navItems = ["Map", "Analysis", "Compare", "Clusters"]
const clusters = [
  { name: "All", color: "#888888" },
  { name: "Heavy Commuter", color: "#185FA5" },
  { name: "Afternoon Peak", color: "#0F6E56" },
  { name: "Moderate", color: "#EF9F27" },
  { name: "Low Volume", color: "#B4B2A9" },
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
            {cluster.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Sidebar