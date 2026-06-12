import pandas as pd
 
#loading cycling data
cycling =pd.read_csv("data/total_rides.csv")
cycling = cycling.dropna()
cycling["date"] = pd.to_datetime(cycling["date"])

#loading weather data
weather =pd.read_csv("data/weather.csv")
weather["date"]= pd.to_datetime(weather["time"])
weather = weather.drop(columns=["time"])

#merge on data
merged = cycling.merge(weather, on="date", how="left")

#Save

merged.to_csv("data/cycling_with_weather.csv", index=False)
print(f"Merged dataset: {len(merged):,} rows")
print(merged.columns.tolist())
print(merged.head())