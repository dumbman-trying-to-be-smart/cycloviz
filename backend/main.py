from fastapi import FastAPI
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# cycling dataset
df = pd.read_csv("data/total_rides.csv")
cluster= pd.read_csv("data/clusters.csv")
df_clean = df.dropna()

df_clean["hour"] = df_clean["time"].str.split("-").str[0].astype(int)
df_clean["date"] = pd.to_datetime(df_clean["date"])
df_clean["day"] = df_clean["date"].dt.dayofweek
df_clean["month"] = df_clean["date"].dt.month

# cycling with weather dataset
df_weather = pd.read_csv("data/cycling_with_weather.csv")
df_weather["date"]= pd.to_datetime(df_weather["date"])

df_weather["rain_category"] = df_weather["precipitation_sum"].apply(
    lambda x: "Heavy rain" if x > 5
    else "Light rain" if x > 1
    else "Dry"
)

df_weather["temp_category"] = df_weather["temperature_2m_mean"].apply(
    lambda x: "Cold" if x < 5
    else "Mild" if x < 15
    else "Warm"
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message":"Welcome to CycloViz API"}

@app.get("/sensors")
def get_sensors():
    streets= df_clean["road_name"].unique().tolist()
    return {"sensors" : streets}

@app.get("/sensors/{street_name}")
def get_street(street_name: str):
    # Filter data for this street
    street_data = df_clean[df_clean["road_name"] == street_name]

    #check if street exists
    if street_data.empty:
        return {"error": "Street not found"}
    
    # Calculate average cyclists
    avg_cyclists= round(street_data["n"].mean())

    # Calculate total daily average
    daily_avg = round(street_data.groupby("date")["n"].sum().mean())

    category = cluster[cluster["road_name"] == street_name]["cluster_name"].iloc[0]
    return {
        "street": street_name,
        "avg_cyclists_per_hour": avg_cyclists,
        "avg_daily_total": daily_avg,
        "cluster": category
    }

@app.get("/clusters")
def get_clusters():
    return {"cluster": cluster[["road_name","cluster_name"]].to_dict("records")}

@app.get("/cluster/{cluster_name}")

def get_category(cluster_name: str):
    cluster_data = cluster[cluster["cluster_name"]== cluster_name]

    if cluster_data.empty:
        return {"Error": "No cluster found."}
    
    return {"street_names": cluster_data["road_name"].to_list()}

@app.get("/compare")
def compare_streets(street_a: str, street_b: str):
    result = {}
    for key, street in [("street_a", street_a), ("street_b", street_b)]:
        data = df_clean[df_clean["road_name"] == street]
        if data.empty:
            return {"error": f"{street} not found"}
        result[key] = {
            "street": street,
            "avg_cyclists_per_hour": round(data["n"].mean()),
            "avg_daily_total": round(data.groupby("date")["n"].sum().mean()),
            "cluster": cluster[cluster["road_name"] == street]["cluster_name"].iloc[0]
        }
    return result

@app.get("/sensors/{street_name}/hourly")
def get_hourly(street_name:str):
    street_data = df_clean[df_clean["road_name"] == street_name]

    if street_data.empty:
        return {"error": "Street not found "}
    
    hourly= street_data.groupby("hour")["n"].mean().round().astype(int)
    hourly= hourly.reset_index()
    hourly.columns =["hour", "avg_cyclists"]

    return{"hourly": hourly.to_dict("records")}

@app.get("/sensors/{street_name}/daily")
def get_daily(street_name:str):
    street_data = df_clean[df_clean["road_name"] == street_name]
    if street_data.empty:
        return {"error": "Street not found"}
    
    daily = street_data.groupby("day")["n"].mean().round().astype(int)
    daily=daily.reset_index()
    daily.columns = ["day", "avg_cyclists"]
    return {"daily": daily.to_dict("records")}

@app.get("/sensors/{street_name}/monthly")
def get_monthly(street_name: str):
    street_data =df_clean[df_clean["road_name"] == street_name]
    if street_data.empty:
        return {"error": "Street not found"}
    

    monthly = street_data.groupby("month")["n"].mean().round().astype(int)
    monthly = monthly.reset_index()
    monthly.columns = ["month", "avg_cyclists"]
    return {"monthly": monthly.to_dict("records")}

@app.get("/weather/impact")
def get_weather_impact():
        rain = df_weather.groupby("rain_category")["n"].mean().round().astype(int)
        temp = df_weather.groupby("temp_category")["n"].mean().round().astype(int)
        wind_cats = df_weather["windspeed_10m_max"].apply(
            lambda x: "Windy" if x > 30 else "Moderate" if x > 15 else "Calm"
        )
        wind = df_weather.groupby(wind_cats)["n"].mean().round().astype(int)

        return{
            "rain_impact": rain.to_dict(),
            "temp_impact": temp.to_dict(),
            "wind_impact": wind.to_dict()
        }

@app.get("/health")
def health():
    return {"status": "ok"}
