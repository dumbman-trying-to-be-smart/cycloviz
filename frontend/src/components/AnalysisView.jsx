import { useState, useEffect } from "react"
import axios from "axios"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const streets = [
  { label: "Torvegade", value: "Torvegade" },
  { label: "Åboulevard", value: "Åboulevard" },
  { label: "Jagtvej", value: "Jagtvej" },
  { label: "Fredensbro", value: "Fredensbro" },
  { label: "Kalvebod Brygge", value: "Kalvebod Brygge" },
  { label: "Vigerslev Allé", value: "Vigerslev Allé" },
  { label: "Dr. Louises Bro", value: "Dr. Louises Bro ( ml. Nørrebrogade og Frederiksborggade)" },
  { label: "Englandsvej", value: "Englandsvej" },
  { label: "Ellebjergvej", value: "Ellebjergvej" },
  { label: "Frederikssundsvej", value: "Frederikssundsvej" },
  { label: "Tuborgvej", value: "Tuborgvej" },
  { label: "Hareskovvej", value: "Hareskovvej" },
  { label: "Roskildevej", value: "Roskildevej" },
]

function AnalysisView() {
  const [selectedStreet, setSelectedStreet] = useState("Torvegade")
  const [streetData, setStreetData] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get(`http://localhost:8000/sensors/${encodeURIComponent(selectedStreet)}`),
      axios.get(`http://localhost:8000/sensors/${encodeURIComponent(selectedStreet)}/hourly`)
    ]).then(([streetRes, hourlyRes]) => {
      setStreetData(streetRes.data)
      setHourlyData(hourlyRes.data.hourly)
      setLoading(false)
    })
  }, [selectedStreet])

  if (loading) return <p>Loading...</p>

  const chartData = {
    labels: hourlyData.map(d => `${d.hour}:00`),
    datasets: [{
    label: "Avg cyclists",
    data: hourlyData.map(d => d.avg_cyclists),
    backgroundColor: hourlyData.map(d =>
        d.hour === 8 || d.hour === 16 ? "#185FA5" : "#B5D4F4"
    ),
    borderRadius: 6,
    borderSkipped: false,
    }]
  }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
        callbacks: {
            label: (context) => `${context.parsed.y.toLocaleString()} cyclists`
        }
        }
    },
    scales: {
        x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: "#999" }
        },
        y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
        ticks: { 
            font: { size: 11 }, 
            color: "#999",
            callback: (value) => value.toLocaleString()
        }
        }
    }
    }

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>Cycling Analysis</h2>
        <select
          value={selectedStreet}
          onChange={e => setSelectedStreet(e.target.value)}
        >
          {streets.map(street => (
            <option key={street.value} value={street.value}>
              {street.label}
            </option>
          ))}
        </select>
      </div>

      <div className="stats-grid">
        <div className="stat-card highlight">
          <p>Selected street</p>
          <h3>{streetData.street}</h3>
        </div>
        <div className="stat-card">
          <p>Avg cyclists per hour</p>
          <h3>{streetData.avg_cyclists_per_hour.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <p>Daily total</p>
          <h3>{streetData.avg_daily_total.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <p>Cluster type</p>
          <h3>{streetData.cluster}</h3>
        </div>
      </div>

      <div className="chart-container">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  )
}

export default AnalysisView