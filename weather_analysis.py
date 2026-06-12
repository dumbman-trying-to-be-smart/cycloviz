import pandas as pd

df = pd.read_csv("data/cycling_with_weather.csv")

df["rain_category"] = df["precipitation_sum"].apply(
    lambda x: "Heavy rain" if x > 5
    else "Light rain" if x > 1
    else "Dry"
)

df["temp_category"] = df["temperature_2m_mean"].apply(
    lambda x: "Cold (below 5°C)" if x < 5
    else "Mild (5-15°C)" if x < 15
    else "Warm (above 15°C)"
)

#rain impact

print("=== rain impact ===")
rain_impact = df.groupby("rain_category")["n"].mean().round() 
print(rain_impact)

#Temperature impact
print("\n=== temperature impact ===")
temp_impact = df.groupby("temp_category")["n"].mean().round()
print(temp_impact)

#wind impact
print("\n=== wind impact ===")
df["wind_category"] = df["windspeed_10m_max"].apply(
    lambda x: "Windy (>30km/h)" if x > 30
    else "Moderate (15-30 km/h)" if x > 15
    else "Calm (below 15 km/h)"
)
wind_impact= df.groupby("wind_category")["n"].mean().round()
print(wind_impact)