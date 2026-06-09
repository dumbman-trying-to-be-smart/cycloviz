import { useState } from "react"
import Sidebar from "./components/Sidebar"
import MapView from "./components/MapView"
import AnalysisView from "./components/AnalysisView"
import CompareView from "./components/CompareView"
import ClusterView from "./components/ClusterView"
import "./App.css"

function App(){
   const [activeNav, setActiveNav] = useState("Map")
   const [selectedStreet, setSelectedStreet] = useState("Torvegade")
   const [selectedCluster, setSelectedCluster] = useState("All")


  return (
    <div className="app">
      <Sidebar 
      activeNav={activeNav} 
      setActiveNav={setActiveNav}
      selectedCluster={selectedCluster}
      setSelectedCluster={setSelectedCluster} 
      />
  
      <div className="main-content">
        {activeNav === "Map" && 
        <MapView 
        setActiveNav={setActiveNav} 
        setSelectedStreet={setSelectedStreet}
        selectedCluster={selectedCluster}
        />
        }
        {activeNav === "Analysis" && <AnalysisView selectedStreet={selectedStreet} setSelectedStreet={setSelectedStreet}/>}
        {activeNav === "Compare" && <CompareView/>} 
        {activeNav === "Clusters" && <ClusterView/>}
      </div>
    </div>
  )
}
export default App

