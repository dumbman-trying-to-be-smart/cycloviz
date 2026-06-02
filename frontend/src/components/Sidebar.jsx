import { useState } from "react"

const navItems = ["Map", "Analysis", "Compare", "Clusters"]

function Sidebar({activeNav, setActiveNav}) {
  
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
    </div>
  )
}

export default Sidebar