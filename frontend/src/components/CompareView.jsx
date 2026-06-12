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
  }, [selectedStreetA, selectedStreetB])

  if (loading) return <p>Loading...</p>
     const chartData ={
        labels: hourlyDataA.map(d => `${d.hour}:00`),
        datasets: [
            {
                label:streetDataA.street,
                data: hourlyDataA.map(d => d.avg_cyclists),
                backgroundColor: "#185FA5",
                borderRadius: 4,
            },
            {
                label: streetDataB.street,
                data: hourlyDataB.map(d => d.avg_cyclists),
                backgroundColor: "#EF9F27",
                borderRadius: 4,
                }
        ]
    }

        const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true }
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