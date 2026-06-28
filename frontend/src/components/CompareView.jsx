import { useState,useEffect } from "react"
import axios from "axios"
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

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

function CompareView(){

    const [selectedStreetA, setSelectedStreetA] = useState("Torvegade")
    const [selectedStreetB, setSelectedStreetB] = useState("Englandsvej")
    const [streetDataA, setStreetDataA] = useState(null)
    const [streetDataB, setStreetDataB]= useState(null)
    const [loading, setLoading] = useState(true)
    const [hourlyDataA, setHourlyDataA] = useState([])
    const [hourlyDataB, setHourlyDataB] = useState([])
    const [error, setError] = useState(false)

    useEffect(() => {
        setLoading(true)

        Promise.all([
            axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreetA)}`),
            axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreetB)}`),
            axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreetA)}/hourly`),
            axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreetB)}/hourly`)
        ]).then(([streetResA, streetResB, hourlyResA, hourlyResB]) => {
      setStreetDataA(streetResA.data)
      setStreetDataB(streetResB.data)
      setHourlyDataA(hourlyResA.data.hourly)
      setHourlyDataB(hourlyResB.data.hourly)
      setLoading(false)
    })
    .catch(() => {
        setError(true)
        setLoading(false)
    })
  }, [selectedStreetA, selectedStreetB])
  

  if (error) return (
  <div className="spinner-container">
    <p style={{ fontSize: "32px" }}>🚲</p>
    <p style={{ color: "#999", fontSize: "14px" }}>Could not load data. Please try again later.</p>
  </div>
)
  

  if (loading)
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
        </div>
    )
    const maxA = Math.max(...hourlyDataA.map(d => d.avg_cyclists))
    const maxB = Math.max(...hourlyDataB.map(d => d.avg_cyclists))

    const chartData = {
        labels: hourlyDataA.map(d => `${d.hour}:00`),
        datasets: [
            {
            label: streetDataA.street,
            data: hourlyDataA.map(d => d.avg_cyclists),
            backgroundColor: "#185FA5",
            borderRadius: 4,
            stack: "same",
            },
            {
            label: streetDataB.street,
            data: hourlyDataB.map(d => -(d.avg_cyclists / maxB) * maxA),
            backgroundColor: "rgba(239, 159, 39, 0.5)",
            borderRadius: 4,
            stack: "same",
            }
        ]
        }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'x',
        datasets: {
            bar: {
            barPercentage: 1,
            categoryPercentage: 0.8,
            }
        },
        plugins: {
            legend: { display: true },
            tooltip: {
            callbacks: {
                label: (context) => {
                if (context.datasetIndex === 0) {
                    return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} cyclists`
                } else {
                    const realValue = Math.round(Math.abs(context.parsed.y) / maxA * maxB)
                    return `${context.dataset.label}: ${realValue.toLocaleString()} cyclists`
                }
                }
            }
            }
        },
        scales: {
            x: {
            grid: { display: false },
            stacked: true,
            ticks: { font: { size: 11 }, color: "#999" }
            },
            y: {
            stacked: false,
            ticks: {
                callback: (value) => {
                if (value >= 0) return value.toLocaleString()
                return Math.round(Math.abs(value) / maxA * maxB).toLocaleString()
                }
            },
            grid: {
                color: (context) => context.tick.value === 0 ? "#999" : "#f0f0f0",
                lineWidth: (context) => context.tick.value === 0 ? 2 : 1,
            }
            }
        }
        }
    return (
        <div className="compare-container">
            
            <div className="compare-header">
            <h2>Compare Streets</h2>
            <div className="compare-selects">
                <select value={selectedStreetA} onChange={e => setSelectedStreetA(e.target.value)}>
                {streets.map(street => (
                    <option key={street.value} value={street.value}>{street.label}</option>
                ))}
                </select>
                <select value={selectedStreetB} onChange={e => setSelectedStreetB(e.target.value)}>
                {streets.map(street => (
                    <option key={street.value} value={street.value}>{street.label}</option>
                ))}
                </select>
            </div>
            </div>

            <div className="compare-cards">
            <div className="compare-card">
                <div>
                <p>Street A</p>
                <span className="street-name">{streetDataA.street}</span>
                </div>
                <div className="compare-stat">
                <p>Avg cyclists per hour</p>
                <h3>{streetDataA.avg_cyclists_per_hour.toLocaleString()}</h3>
                </div>
                <div className="compare-stat">
                <p>Daily total</p>
                <h3>{streetDataA.avg_daily_total.toLocaleString()}</h3>
                </div>
                <div className="compare-stat">
                <p>Cluster type</p>
                <h3>{streetDataA.cluster}</h3>
                </div>
            </div>

            <div className="compare-card">
                <div>
                <p>Street B</p>
                <span className="street-name">{streetDataB.street}</span>
                </div>
                <div className="compare-stat">
                <p>Avg cyclists per hour</p>
                <h3>{streetDataB.avg_cyclists_per_hour.toLocaleString()}</h3>
                </div>
                <div className="compare-stat">
                <p>Daily total</p>
                <h3>{streetDataB.avg_daily_total.toLocaleString()}</h3>
                </div>
                <div className="compare-stat">
                <p>Cluster type</p>
                <h3>{streetDataB.cluster}</h3>
                </div>
            </div>
            </div>
            <div className="chart-container">
                <p className="chart-title">Hourly comparison</p>
                <Bar data={chartData} options={chartOptions} />
            </div>
    </div>
)

}

export default CompareView