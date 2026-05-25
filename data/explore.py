import pandas as pd
# reading the total_rides.csv file
df = pd.read_csv("data/total_rides.csv")

# removing the null value (cleaning the dataset)
df_clean = df.dropna()
print(df_clean)

# checking again if the null value exists
print(df_clean.isnull().sum())

# Extract hour from time column e.g. "08-09" becomes 8
df_clean['hour']= df_clean['time'].str.split("-").str[0].astype(int)
print(df_clean['hour'].head())

# getting avg of number of cyclist by hours
hourly_avg = df_clean.groupby("hour")["n"].mean().round().astype(int)
hourly_avg = hourly_avg.reset_index()

# giving the column name for mean value
hourly_avg.columns = ["hour", "avg_cyclists"]
print(hourly_avg)

#importing matplotlib for data visualization
from matplotlib import pyplot as plt

plt.style.use("seaborn-v0_8")
plt.figure(figsize=(12, 5))

colors= ["tomato" if hour in [8,16] else "steelblue" for hour in hourly_avg['hour']]

plt.bar(hourly_avg["hour"],hourly_avg["avg_cyclists"],color=colors)
plt.xticks(hourly_avg['hour'])
plt.title("Avg Number of cyclist per hour")
plt.xlabel("Hour")
plt.ylabel("Avg Number of cyclist")
#plt.savefig("data/plot_hourly.png")
#plt.show()

# Convert date column to datetime format
df_clean["date"] = pd.to_datetime(df_clean["date"])
print(df_clean.head())

# extracting day of the week
df_clean["day"] = df_clean["date"].dt.day_of_week
print(df_clean["day"].head())

#getting avg n of cyclist per day
daily_avg=df_clean.groupby("day")["n"].mean().round().astype(int)
daily_avg = daily_avg.reset_index()  
daily_avg.columns =["day","avg_cyclist"]
print(daily_avg)

#ploting graph for avg n of cyclist per day
plt.style.use("seaborn-v0_8")
plt.figure(figsize=(12, 5))

day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
colors= ["tomato" if day in [5,6] else "steelblue" for day in daily_avg["day"]]

plt.bar(daily_avg["day"],daily_avg["avg_cyclist"],color=colors )
plt.xticks(daily_avg["day"], day_names)
plt.title("Avg Number of cyclist per day")
plt.xlabel("Days of the week")
plt.ylabel("Avg Number of cyclist")
plt.savefig("data/plot_daily.png")
plt.show()

# for monthly
df_clean["month"]=df_clean["date"].dt.month
print(df_clean["month"].head())

#monthly avg
monthly_avg = df_clean.groupby("month")["n"].mean().astype(int)
print(monthly_avg.head())

monthly_avg = monthly_avg.reset_index()
monthly_avg.columns = ["month", "avg_cyclist"]
print(monthly_avg)

#plotting monthly avg

plt.style.use("seaborn-v0_8")
plt.figure(figsize=(12, 5))

month_names=[ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
colors=["tomato" if month in [6,7,8] else "steelblue" for month in monthly_avg["month"]]

plt.bar(monthly_avg["month"],monthly_avg["avg_cyclist"],color=colors)
plt.xticks(monthly_avg["month"],month_names)
plt.title("Avg Number of cyclist per month")
plt.xlabel("Month")
plt.ylabel("Avg number of cyclist")
plt.savefig("data/plot_monthly.png")
plt.show()
