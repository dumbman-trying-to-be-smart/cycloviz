import { useState } from "react"
import Sidebar from "./components/Sidebar"
import MapView from "./components/MapView"
import AnalysisView from "./components/AnalysisView"
import CompareView from "./components/CompareView"
import ClusterView from "./components/ClusterView"
import "./App.css"

function App(){
   const [activeNav, setActiveNav] = useState("Map")

  return (
    <div className="app">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="main-content">
        {activeNav === "Map" && <MapView/>}
        {activeNav === "Analysis" && <AnalysisView/>}
        {activeNav === "Compare" && <CompareView/>} 
        {activeNav === "Clusters" && <ClusterView/>}
      </div>
    </div>
  )
}
export default App

