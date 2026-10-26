import { useState,useEffect } from "react"
import axios from "axios"
import Loader from "./loader"
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

const RUSH_HOURS = [7, 8, 9, 15, 16, 17]

function getShapeStats(hourly) {
    const total = hourly.reduce((sum, d) => sum + d.avg_cyclists, 0)
    if (hourly.length === 0 || total === 0) return { peakHour: "-", rushShare: "-" }
    const peak = hourly.reduce((best, d) => d.avg_cyclists > best.avg_cyclists ? d : best, hourly[0])
    const rush = hourly
        .filter(d => RUSH_HOURS.includes(Number(d.hour)))
        .reduce((sum, d) => sum + d.avg_cyclists, 0)
    return {
        peakHour: `${String(peak.hour).padStart(2, "0")}:00`,
        rushShare: `${Math.round((rush / total) * 100)}%`
    }
}

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
    return <Loader />
    const maxA = Math.max(...hourlyDataA.map(d => d.avg_cyclists))
    const maxB = Math.max(...hourlyDataB.map(d => d.avg_cyclists))
    const shapeA = getShapeStats(hourlyDataA)
    const shapeB = getShapeStats(hourlyDataB)

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
            ticks: { font: { size: 11 }, color: "#999" },
            title: { display: true, text: "Hour of day", color: "#999", font: { size: 12 }}
            },
            y: {
            stacked: false,
            title: { display: true, text: "Avg cyclists per hour (each street on its own scale)", color: "#999", font: { size: 12 } },
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
                <p>Cluster type</p>
                <h3>{streetDataA.cluster}</h3>
                </div>
                <div className="compare-stat">
                <p>Peak hour</p>
                <h3>{shapeA.peakHour}</h3>
                </div>
                <div className="compare-stat">
                <p>Traffic in rush hours</p>
                <h3>{shapeA.rushShare}</h3>
                <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal" }}>07:00-09:00 and 15:00-17:00</p>
                </div>
                <div className="compare-stat">
                <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal" }}>Volume, averaged over this sensor's recording period</p>
                <p style={{ fontSize: "13px", color: "#666", textTransform: "none", letterSpacing: "normal" }}>
                    {streetDataA.avg_cyclists_per_hour.toLocaleString()} cyclists per hour · {streetDataA.avg_daily_total.toLocaleString()} per day
                </p>
                </div>
            </div>

            <div className="compare-card">
                <div>
                <p>Street B</p>
                <span className="street-name">{streetDataB.street}</span>
                </div>
                <div className="compare-stat">
                <p>Cluster type</p>
                <h3>{streetDataB.cluster}</h3>
                </div>
                <div className="compare-stat">
                <p>Peak hour</p>
                <h3>{shapeB.peakHour}</h3>
                </div>
                <div className="compare-stat">
                <p>Traffic in rush hours</p>
                <h3>{shapeB.rushShare}</h3>
                <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal" }}>07:00-09:00 and 15:00-17:00</p>
                </div>
                <div className="compare-stat">
                <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal" }}>Volume, averaged over this sensor's recording period</p>
                <p style={{ fontSize: "13px", color: "#666", textTransform: "none", letterSpacing: "normal" }}>
                    {streetDataB.avg_cyclists_per_hour.toLocaleString()} cyclists per hour · {streetDataB.avg_daily_total.toLocaleString()} per day
                </p>
                </div>
            </div>
            </div>
            <div style={{ fontSize: "12px", color: "#777", margin: "12px 0", lineHeight: 1.5 }}>
                <p style={{ margin: 0 }}>Each sensor was recording over different years, so volumes are only a rough guide when comparing streets.</p>
                <p style={{ margin: "4px 0 0" }}>The bars for Street B are scaled to match Street A's peak, so compare the shapes, not the heights.</p>
            </div>
            <div className="chart-container">
                <p className="chart-title">Hourly comparison</p>
                <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Street A (blue) points up and Street B (orange) points down. Compare when each street is busy, not how tall the bars are.</p>
                <Bar data={chartData} options={chartOptions} />
            </div>
    </div>
)

}

export default CompareView
