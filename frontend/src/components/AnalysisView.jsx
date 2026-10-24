import { useState, useEffect } from "react"
import axios from "axios"
import Loader from "./Loader"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Bar } from "react-chartjs-2" 

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement,
  Title, Tooltip, Legend
)

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

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


function AnalysisView({selectedStreet,setSelectedStreet}) {
  const [streetData, setStreetData] = useState(null)
  const [hourlyData, setHourlyData] = useState([])
  const [dailyData, setDailyData] =useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [weatherData, setWeatherData] =useState(null)
  const [activeTab, setActiveTab] = useState("traffic")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreet)}`),
      axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreet)}/hourly`),
      axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreet)}/daily`),
      axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreet)}/monthly`),
      axios.get(`https://cycloviz-backend.onrender.com/weather/impact`)
    ]).then(([streetRes, hourlyRes, dailyRes, monthlyRes,weatherRes]) => {
      setStreetData(streetRes.data)
      setHourlyData(hourlyRes.data.hourly)
      setDailyData(dailyRes.data.daily)
      setMonthlyData(monthlyRes.data.monthly)
      setWeatherData(weatherRes.data)
      setLoading(false)
    })
    .catch(() => {
      setError(true)
      setLoading(false)
    })
  }, [selectedStreet])
  

  if (error) return(
    <div className="spinner-container">
      <p style={{fontSize: "32px" }}>🚲</p>
      <p style ={{ color: "#999", fontSize: "14px"}}>Could not load data. Please try again later.</p>

    </div>
  )

  if (loading || !streetData || !hourlyData || !dailyData || !monthlyData) {
    return <Loader />
  }
  

  const chartData = {
    labels: hourlyData.map(d => `${d.hour}:00`),
    datasets: [{
    labels: "Avg cyclists",
    data: hourlyData.map(d => d.avg_cyclists),
    backgroundColor: hourlyData.map(d =>
        d.hour === 8 || d.hour === 16 ? "#185FA5" : "#B5D4F4"
    ),
    borderRadius: 6,
    borderSkipped: false,
    }]
  }

  const dailyChartData ={
    labels: dailyData.map (d => dayNames[d.day]),
    datasets:[{
      label: "Avg cyclists",
      data: dailyData.map(d => d.avg_cyclists),
      backgroundColor: dailyData.map(d => 
        d.day === 5 || d.day === 6 ? "#EF9F27" : "#185FA5"
      ),
      borderRadius:4
    }]

  }

  const monthlyChartData ={
    labels: monthlyData.map(m => monthNames[m.month - 1]),
    datasets:[{
      label: "Avg cyclists",
      data: monthlyData.map(m => m.avg_cyclists),
      backgroundColor: monthlyData.map(d =>
        d.month >= 6 && d.month <= 8 ? "#185FA5" : "#B5D4F4"
      ),
      borderRadius: 4,
    }]
  }

  const weekdayAvg = Math.round(
      dailyData.filter(d => d.day >= 0 && d.day <= 4).reduce((sum, d) => sum + d.avg_cyclists,0)/5
    )
  
  const weekendAvg = Math.round(
    dailyData.filter(d => d.day ===5 || d.day ===6).reduce((sum, d) => sum + d.avg_cyclists, 0)/2
  )

  const weekdayweekendData = {
    labels: ["Weekday", "Weekend"],
    datasets: [{
      label: "Avg cyclists",
      data: [weekdayAvg, weekendAvg],
      backgroundColor: ["#185FA5", "#EF9F27"],
      borderRadius: 6,
    }]
  }

  const peakHour = hourlyData.reduce((max, d) => d.avg_cyclists > max.avg_cyclists ? d : max, hourlyData[0])

  const clusterDescriptions = {
    "Balanced Commuter Routes": "Morning and afternoon peaks of about equal size",
    "Afternoon-Evening Route": "Small morning peak, large afternoon peak and busier evenings",
    "Rush-Hour Route": "Sharp peaks around 07:00 and 16:00, very little traffic at night",
    "Afternoon-Leaning Commuter Routes": "Commuter pattern with a slightly larger afternoon peak"
  }

  const rainChartData ={
    labels: ["Dry", "Light Rain", "Heavy Rain"],
    datasets: [{
      label:"Avg cyclists",
      data: [
        weatherData.rain_impact["Dry"],
        weatherData.rain_impact["Light rain"],
        weatherData.rain_impact["Heavy rain"]
      ],
      backgroundColor: ["rgba(24, 95, 165, 0.25)", "rgba(24, 95, 165, 0.5)", "rgba(24, 95, 165, 0.85)"],
      borderRadius:4,
    }]
  }
  
  const tempChartData ={
    labels: ["Cold", "Mild", "Warm"],
    datasets:[{
      label: "Avg cyclists",
      data: [
        weatherData.temp_impact["Cold"],
        weatherData.temp_impact["Mild"],
        weatherData.temp_impact["Warm"]
      ],
       backgroundColor: ["rgba(230, 126, 34, 0.25)", "rgba(230, 126, 34, 0.5)", "rgba(230, 126, 34, 0.85)"],
      borderRadius: 4,
    }]
  }

  const windChartData = {
    labels: ["Calm", "Moderate", "Windy"],
    datasets: [{
      label: "Avg cyclists",
      data: [
        weatherData.wind_impact["Calm"],
        weatherData.wind_impact["Moderate"],
        weatherData.wind_impact["Windy"]
      ],
      backgroundColor: ["rgba(39, 174, 96, 0.25)", "rgba(39, 174, 96, 0.5)", "rgba(39, 174, 96, 0.85)"],
      borderRadius: 4,
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

  const withAxisTitles = (xTitle) => ({
    ...chartOptions,
    scales: {
      x: { ...chartOptions.scales.x, title: { display: true, text: xTitle, color: "#999", font: { size: 12 } } },
      y: { ...chartOptions.scales.y, title: { display: true, text: "Avg cyclists per hour", color: "#999", font: { size: 12 } } }
    }
  })

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
          <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal", marginTop: "4px" }}>Cyclists passing in an average hour, over this sensor's recording period</p>
        </div>
        <div className="stat-card">
          <p>Daily total</p>
          <h3>{streetData.avg_daily_total.toLocaleString()}</h3>
          <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal", marginTop: "4px" }}>Cyclists in an average day, over this sensor's recording period</p>
        </div>
        <div className="stat-card tooltip-card">
          <p>Cluster type</p>
          <h3>{streetData.cluster}</h3>
          <p style={{ fontSize: "12px", color: "#777", textTransform: "none", letterSpacing: "normal", marginTop: "4px" }}>{clusterDescriptions[streetData.cluster]}</p>
          <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal", marginTop: "4px" }}>Streets are grouped by the shape of their daily pattern, not by volume.</p>
        </div>
      </div>
      <div className="tab-bar">
        <button
        className={activeTab == "traffic" ? "tab-btn active": "tab-btn"}
        onClick={() => setActiveTab("traffic")}
        >
          Traffic Patterns
        </button>
        <button
        className={activeTab == "weather" ? "tab-btn active": "tab-btn"}
        onClick={() => setActiveTab("weather")}
        >
          Weather Impact
        </button>
        <button
        className={activeTab == "trends" ? "tab-btn active" : "tab-btn"}
        onClick={() => setActiveTab("trends")}
        >
          Weekday vs weekend
        </button>
      </div>
      {activeTab === "traffic" &&(
        <>
        <div className="stat-card" style={{ background: "#EAF3F8", border: "0.5px solid #B5D4F4" }}>
          <p>Peak hour</p>
          <h3>
            {(() => {
              let peakHour = hourlyData[0]
              for (let i = 0; i < hourlyData.length; i++) {
                if (hourlyData[i].avg_cyclists > peakHour.avg_cyclists) {
                  peakHour = hourlyData[i]
                }
              }
              return `${peakHour.hour}:00 — ${peakHour.avg_cyclists.toLocaleString()} cyclists`
            })()}
          </h3>
          <p style={{ fontSize: "11px", color: "#999", textTransform: "none", letterSpacing: "normal", marginTop: "4px" }}>The busiest hour of an average day (a label of 16:00 covers 16:00 to 17:00).</p>
        </div>
        <div className="chart-container">
          <div style ={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <p className="chart-title" style={{margin: 0}}>Average cyclists by hour of day</p>
            <button
            style={{ fontSize: "12px", padding: "4px 10px", border: "0.5px solid #d0d0d0", borderRadius:"6px", cursor:"pointer", background:"white", color: "#555", whiteSpace:"nowrap"}}
            onClick={() => {
              const canvas = document.querySelector("canvas")
              const link = document.createElement("a")
              link.download = "cycloviz-chart.png"
              link.href = canvas.toDataURL()
              link.click()
            }}
            >
              Export ↓
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Each bar is one hour (08:00 means 08:00 to 09:00). Dark bars mark the usual rush hours at 08:00 and 16:00.</p>
          <Bar data={chartData} options={withAxisTitles("Hour of day")} />
        </div>
        <div className="chart-container">
          <p className="chart-title">Average cyclists by day of week</p>
          <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Orange bars are weekend days.</p>
          <Bar data={dailyChartData} options={withAxisTitles("Day of week")} />
        </div>
        <div className="chart-container">
          <p className="chart-title">Average cyclists by month</p>
          <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Dark bars are the summer months (June to August).</p>
          <Bar data={monthlyChartData} options={withAxisTitles("Month")} />
        </div>
        </>
      )}

      {activeTab === "weather" && (
        <>
          <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>These weather figures cover all 13 sensors, not only the selected street. Cold and wet days are more common in winter, so part of each difference may be due to the season.</p>
          <div className="weather-charts">
            <div className="chart-container-small">
              <p className="chart-title">Rain impact</p>
              <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Dry: under 1 mm in the day. Light rain: 1 to 5 mm. Heavy rain: over 5 mm.</p>
              <Bar data={rainChartData} options={withAxisTitles("Rainfall")} />
            </div>
            <div className="chart-container-small">
              <p className="chart-title">Temperature impact</p>
              <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Daily mean. Cold: below 5 °C. Mild: 5 to 15 °C. Warm: above 15 °C.</p>
              <Bar data={tempChartData} options={withAxisTitles("Temperature")} />
            </div>
            <div className="chart-container-small">
              <p className="chart-title">Wind impact</p>
              <p style={{ fontSize: "12px", color: "#777", margin: "4px 0 8px" }}>Daily maximum. Calm: below 15 km/h. Moderate: 15 to 30 km/h. Windy: above 30 km/h.</p>
              <Bar data={windChartData} options={withAxisTitles("Wind speed")} />
            </div>
          </div> 
        </>
      )}
      {activeTab === "trends" && (
        <>
        <div className="chart-container">
          <p className="chart-title">Weekday vs Weekend average</p>
          <Bar data={weekdayweekendData} options={withAxisTitles("Day type")} />
        </div>
        </>
      )} 
    </div>
  )
}

export default AnalysisView
