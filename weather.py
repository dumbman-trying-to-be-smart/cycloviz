import requests
import pandas as pd

url = "https://archive-api.open-meteo.com/v1/archive"

params = {
    "latitude":55.6761,
    "longitude":12.5683,
    "start_date": "2005-01-01",
    "end_date": "2014-12-31",
    "daily" : "temperature_2m_mean,precipitation_sum,windspeed_10m_max",
    "timezone": "Europe/Copenhagen"
}

response =requests.get(url, params= params)
print("Status:", response.status_code)

if response.status_code ==200:
    data = response.json()
    df= pd.DataFrame(data["daily"])
    df.to_csv("data/weather.csv", index=False)
    print(F"Saved {len(df)} rows")
    print(df.head())
else:
    print("Error:", response.text)