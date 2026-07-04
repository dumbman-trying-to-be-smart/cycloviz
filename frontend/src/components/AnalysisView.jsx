import { useState, useEffect } from "react"
import axios from "axios"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,   // add this
  PointElement,  // add this
  Title,
  Tooltip,
  Legend
} from "chart.js"
import { Bar, Line } from "react-chartjs-2" 

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement,
  LineElement, PointElement,  // add these
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
  const [yearlyData, setYearlyData] = useState([])
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
      axios.get(`https://cycloviz-backend.onrender.com/sensors/${encodeURIComponent(selectedStreet)}/yearly`),
      axios.get(`https://cycloviz-backend.onrender.com/weather/impact`)
    ]).then(([streetRes, hourlyRes, dailyRes, monthlyRes,yearlyRes,weatherRes]) => {
      setStreetData(streetRes.data)
      setHourlyData(hourlyRes.data.hourly)
      setDailyData(dailyRes.data.daily)
      setMonthlyData(monthlyRes.data.monthly)
      setYearlyData(yearlyRes.data.yearly)
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

  if (loading || !streetData || !hourlyData || !dailyData || !monthlyData || !yearlyData) {
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

  const yearlyChartData ={
    labels: yearlyData.map(d => d["year"]),
    datasets:[{
      label: "Avg cyclists",
      data: yearlyData.map(m => m.avg_cyclists),
      backgroundColor: yearlyData.map(d => 
        d.year === 2006 && d.year === 2014? "#185FA5" : "#B5D4F4"
      ),
      borderRadius: 4,
    }],
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
    "Heavy Commuter Routes": "High traffic roads used mainly for commuting",
    "Afternoon Peak Route": "Roads that get busy in the afternoon",
    "Moderate Routes": "Medium traffic, less busy than commuter roads",
    "Low Volume Routes": "Quiet roads with few cyclists"
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
        <div className="stat-card tooltip-card">
          <p>Cluster type</p>
          <h3>{streetData.cluster}</h3>
          <span className="tooltip">{clusterDescriptions[streetData.cluster]}</span>
        </div>
        <div className="stat-card peak-hour-card">
          <p>Peak hour</p>
          <h3>{peakHour.hour}:00 — {peakHour.avg_cyclists.toLocaleString()} cyclists</h3>
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
          Trends
        </button>
      </div>
      {activeTab === "traffic" &&(
        <>
        <div className="chart-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <p className="chart-title" style={{ margin: 0 }}>Average cyclists by hour of day</p>
            <button
              style={{ fontSize: "12px", padding: "4px 10px", border: "0.5px solid #d0d0d0", borderRadius: "6px", cursor: "pointer", background: "white", color: "#555", whiteSpace: "nowrap" }}
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
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        <div className="chart-container">
          <p className="chart-title">Average cyclists by day of week</p>
          <Bar data={dailyChartData} options={chartOptions} />
        </div>
        <div className="chart-container">
          <p className="chart-title">Average cyclists by month</p>
          <Bar data={monthlyChartData} options={chartOptions} />
        </div>
        </>
      )}

      {activeTab === "weather" && (
        <>
          <div className="weather-charts">
            <div className="chart-container-small">
              <p className="chart-title">Rain impact</p>
              <Bar data={rainChartData} options={chartOptions} />
            </div>
            <div className="chart-container-small">
              <p className="chart-title">Temperature impact</p>
              <Bar data={tempChartData} options={chartOptions} />
            </div>
            <div className="chart-container-small">
              <p className="chart-title">Wind impact</p>
              <Bar data={windChartData} options={chartOptions} />
            </div>
          </div> 
        </>
      )}
      {activeTab === "trends" && (
        <>
        <div className="chart-container">
          <p className="chart-title">Yearly cyclist trend</p>
          <Line
            data={{
              labels: yearlyData.map(d => d.year),
              datasets: [{
                label: "Avg cyclists",
                data: yearlyData.map(d => d.avg_cyclists),
                borderColor: "#185FA5",
                borderWidth: 2.5,
                pointRadius: 5,
                pointBackgroundColor: "#fff",
                pointBorderColor: "#185FA5",
                pointBorderWidth: 2.5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: "#185FA5",
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 2,
                tension: 0.4,
                
              }]
            }}
            plugins={[{
              id: "gradientFill",
              beforeDraw(chart) {
              const { ctx, chartArea: { bottom }, scales: { x, y } } = chart;
              const meta = chart.getDatasetMeta(0);
              if (!meta.data.length) return;

              ctx.save();
              const gradient = ctx.createLinearGradient(0, chart.chartArea.top, 0, bottom);
              gradient.addColorStop(0, "rgba(24,95,165,0.18)");
              gradient.addColorStop(1, "rgba(24,95,165,0.00)");

              ctx.beginPath();
              ctx.moveTo(meta.data[0].x, bottom);          // start at bottom-left
              ctx.lineTo(meta.data[0].x, meta.data[0].y);  // line up to first point

              for (let i = 1; i < meta.data.length; i++) {
                const prev = meta.data[i - 1];
                const curr = meta.data[i];
                const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
                const cpy1 = prev.y;
                const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
                const cpy2 = curr.y;
                ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, curr.x, curr.y);
              }

              ctx.lineTo(meta.data[meta.data.length - 1].x, bottom); // down to bottom-right
              ctx.closePath();
              ctx.lineTo(meta.data[meta.data.length - 1].x, bottom);
              ctx.lineTo(meta.data[0].x, bottom);
              ctx.closePath();
              ctx.fillStyle = gradient;
              ctx.fill();
              ctx.restore();
            }
            }]}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 800, easing: "easeInOutQuart" },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#fff",
                  titleColor: "#185FA5",
                  bodyColor: "#444",
                  borderColor: "#B5D4F4",
                  borderWidth: 1,
                  padding: 12,
                  cornerRadius: 8,
                  displayColors: false,
                  callbacks: {
                    title: (items) => `Year ${items[0].label}`,
                    label: (context) => `${context.parsed.y.toLocaleString()} cyclists`,
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  border: { display: false },
                  ticks: { color: "#999", font: { size: 11 } }
                },
                y: {
                  beginAtZero: false,
                  grid: { color: "#f0f0f0" },
                  border: { display: false },
                  ticks: {
                    color: "#999",
                    font: { size: 11 },
                    callback: (v) => v.toLocaleString()
                  }
                }
              }
            }}
          />
        </div>
        <div className="chart-container">
          <p className="chart-title">Weekday vs Weekend average</p>
          <Bar data={weekdayweekendData} options={chartOptions} />
        </div>
        </>
      )} 
    </div>
  )
}

export default AnalysisView