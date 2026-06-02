import { useState } from "react"
import Sidebar from "./components/Sidebar"
import "./App.css"

function App(){
   const [activeNav, setActiveNav] = useState("Map")

  return (
    <div className="app">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="main-content">
        <h1>{activeNav} view</h1>
      </div>
    </div>
  )
}
export default App

