// Simple line icons (24x24, drawn with the current text colour)
const icons = {
  Map: (
    <>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </>
  ),
  Analysis: (
    <>
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="6" y1="17" x2="6" y2="12" />
      <line x1="12" y1="17" x2="12" y2="5" />
      <line x1="18" y1="17" x2="18" y2="9" />
    </>
  ),
  Compare: (
    <>
      <path d="M7 3 3 7l4 4" />
      <path d="M3 7h18" />
      <path d="M17 13l4 4-4 4" />
      <path d="M21 17H3" />
    </>
  ),
  Clusters: (
    <>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="7" r="3" />
      <circle cx="12" cy="17" r="3" />
    </>
  ),
}

const navItems = ["Map", "Analysis", "Compare", "Clusters"]

function Sidebar({activeNav, setActiveNav}) {

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          {/* bicycle */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5.5" cy="16.5" r="3.5" />
            <circle cx="18.5" cy="16.5" r="3.5" />
            <path d="M5.5 16.5 9 9h6l3.5 7.5M9 9l3 7.5L15 9M8 6h3" />
          </svg>
        </div>
        <span className="sidebar-name">CycloViz</span>
      </div>

      <nav className="nav-items">
        {navItems.map(item => (
          <button
            key={item}
            className={activeNav === item ? "nav-btn active" : "nav-btn"}
            onClick={() => setActiveNav(item)}
            title={item}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {icons[item]}
            </svg>
            {item}
          </button>
      ))}
      </nav>
    </div>
  )
}

export default Sidebar
