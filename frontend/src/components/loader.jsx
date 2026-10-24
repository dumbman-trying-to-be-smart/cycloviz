import { useState, useEffect } from "react"

// Shared loading screen (bicycle animation). After 5 seconds it explains why loading is slow:
// the free Render server goes to sleep when nobody uses it and takes a while to wake up.
function Loader() {
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 5000)
    return () => clearTimeout(timer)
  }, [])

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
      {slow && (
        <p style={{ color: "#999", fontSize: "13px", marginTop: "12px", textAlign: "center", maxWidth: "340px", lineHeight: 1.4 }}>
          This is taking longer than usual. The server may be waking up after a period of inactivity, which can take up to 30 seconds.
        </p>
      )}
    </div>
  )
}

export default Loader
