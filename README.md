# CycloViz

CycloViz is an interactive dashboard for bicycle traffic in Copenhagen. It uses hourly counts from 13 street sensors (2005–2014) and daily weather data. With it you can:

- **Map**: see every sensor on a map of Copenhagen, coloured by cluster
- **Analysis**: view a street's average traffic by hour, weekday and month, and how weather relates to cycling
- **Compare**: put two streets side by side
- **Clusters**: see the streets grouped by the shape of their daily traffic pattern

## Tech stack

| Part      | Tools                                                          |
|-----------|----------------------------------------------------------------|
| Frontend  | React 19, Vite, Chart.js, MapLibre (react-map-gl), MapTiler     |
| Backend   | FastAPI, pandas                                                |
| Analysis  | scikit-learn (K-Means, Ward), matplotlib, seaborn              |
| Weather   | [Open-Meteo historical archive](https://open-meteo.com/)       |

## Data sources

- **Cycling counts:** hourly bicycle counts from 13 street sensors in Copenhagen, 2005–2014, from [Bike Traffic Counts in Copenhagen](https://www.kaggle.com/datasets/emilhvitfeldt/bike-traffic-counts-in-copenhagen) by Emil Hvitfeldt on Kaggle.
- **Weather:** daily mean temperature, total precipitation and maximum wind speed for Copenhagen, from the [Open-Meteo historical archive](https://open-meteo.com/en/docs/historical-weather-api).

## Project structure

```
cycloviz/
├── backend/main.py        FastAPI app (all API endpoints)
├── frontend/              React + Vite app
│   └── src/components/    MapView, AnalysisView, CompareView, ClusterView, Sidebar, Loader
├── data/                  CSV datasets and generated plots
├── clustering.py          K-Means clustering of streets → data/clusters_new.csv
├── weather.py             downloads daily weather → data/weather.csv
├── merge_weather.py       joins rides and weather → data/cycling_with_weather.csv
└── explore.py, compare.py, check_*.py   exploration and robustness checks
```

## Installation

### Prerequisites

- [Python](https://www.python.org/downloads/) 3.11 or newer
- [Node.js](https://nodejs.org/) 20 or newer (with npm)
- A free [MapTiler](https://www.maptiler.com/cloud/) API key (used for the map tiles)

### 1. Clone the repository

```bash
git clone https://github.com/dumbman-trying-to-be-smart/cycloviz.git
cd cycloviz
```

The `data/` folder is about 130 MB, so the clone can take a minute.

### 2. Set up the backend

Create a virtual environment and install the dependencies (run this from the project root):

```bash
python -m venv venv

# Windows (PowerShell)
venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

To also run the analysis scripts (clustering, plots, weather download), install the extra packages:

```bash
pip install -r requirements-analysis.txt
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a file named `frontend/.env` with your MapTiler key:

```
VITE_MAPTILER_KEY=your_maptiler_key_here
```

## Running the application

### Start the backend

From the **project root**, with the virtual environment active (the API loads CSV files from `data/` relative to where you start it):

```bash
uvicorn backend.main:app --reload
```

The API runs at <http://localhost:8000>. It takes a few seconds to start because it loads the datasets into memory. Interactive API docs are available at <http://localhost:8000/docs>.

### Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

Open <http://localhost:5173> in your browser.

> **Note:** by default the frontend uses the deployed backend at `https://cycloviz-backend.onrender.com`.
> To use your local backend instead, add this line to `frontend/.env` and restart `npm run dev`:
>
> ```
> VITE_API_URL=http://localhost:8000
> ```
>
> The deployed backend runs on Render's free plan and sleeps when no one uses it, so the first request can take up to 30 seconds.

### Run the tests

From the project root, with the virtual environment active:

```bash
pip install pytest httpx
python -m pytest tests
```

### Build for production

```bash
cd frontend
npm run build      # outputs to frontend/dist
npm run preview    # serves the built app locally
```

## API endpoints

| Method | Endpoint                          | Description                                         |
|--------|-----------------------------------|-----------------------------------------------------|
| GET    | `/sensors`                        | List of all street names                            |
| GET    | `/sensors/{street}`               | Average cyclists per hour, average daily total, cluster |
| GET    | `/sensors/{street}/hourly`        | Average cyclists by hour of day                     |
| GET    | `/sensors/{street}/daily`         | Average cyclists by day of week (0 = Monday)        |
| GET    | `/sensors/{street}/monthly`       | Average cyclists by month                           |
| GET    | `/sensors/{street}/yearly`        | Average daily total by year                         |
| GET    | `/compare?street_a=…&street_b=…`  | Summary statistics for two streets                  |
| GET    | `/map`                            | Every sensor with its position, cluster and average cyclists per hour (used by the map) |
| GET    | `/clusters`                       | Every street with its cluster name                  |
| GET    | `/cluster/{cluster_name}`         | Streets in one cluster                              |
| GET    | `/weather/impact`                 | Average cyclists per hour by rain, temperature and wind category |
| GET    | `/health`                         | Health check                                        |

## Regenerating the data

The processed files in `data/` are already committed, so you only need these steps to rebuild them. Run them from the project root with `requirements-analysis.txt` installed:

```bash
python weather.py         # download daily weather 2005–2014 → data/weather.csv
python merge_weather.py   # join with ride counts → data/cycling_with_weather.csv
python clustering.py      # cluster streets → data/clusters_new.csv + plots in data/
```

`clustering.py` writes `data/clusters_new.csv` and does **not** overwrite `data/clusters.csv`. After you check the new clusters, copy the file over `data/clusters.csv` to use it in the app.

## How the clustering works

The data for each street is turned into a 24-hour profile: the average number of cyclists for each hour of the day. Each profile is then normalised, so streets are grouped by the **shape** of their day rather than by how many cyclists they carry. K-Means (k = 4, 100 random starts, fixed seed) groups the streets. Ward hierarchical clustering is used as a check, and it gives the same groups. The table comparing k = 2 to 7 is in `data/k_comparison.csv`.
