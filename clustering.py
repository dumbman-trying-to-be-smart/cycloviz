import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize

# Load and clean data
df = pd.read_csv("data/total_rides.csv")
df_clean = df.dropna()
df_clean["hour"] = df_clean["time"].str.split("-").str[0].astype(int)

hourly_profiles= df_clean.pivot_table(
    index="road_name",
    columns="hour",
    values="n",
    aggfunc="mean"
).round().astype(int)
print(hourly_profiles.head())

# normalizing the data for patter
profiles_normalized = normalize(hourly_profiles)
print(profiles_normalized)

from matplotlib import pyplot as plt

inertias =[]
k_values = range(2,8)

for k in k_values:
    kmeans = KMeans(n_clusters=k, random_state=42)
    kmeans.fit(profiles_normalized)
    inertias.append(kmeans.inertia_)

plt.plot(k_values, inertias, marker="o")
plt.title("Elbow Method")
plt.xlabel("Number of cluster(K)")
plt.ylabel("Inertia")
plt.show()

kmeans = KMeans(n_clusters=4, random_state=42)
kmeans.fit(profiles_normalized)
hourly_profiles["cluster"]=kmeans.labels_
print(hourly_profiles["cluster"])

for cluster_num in range(4):
    print(f"\n=== Cluster {cluster_num} ===")
    cluster_streets = hourly_profiles[hourly_profiles["cluster"] == cluster_num]
    print(cluster_streets.index.tolist())


cluster_profiles = hourly_profiles.groupby("cluster").mean()
print(cluster_profiles)

for cluster_num in range(4):
    plt.plot(
        range(24),
        cluster_profiles.loc[cluster_num],
        marker="o",
        label=f"Cluster {cluster_num}"
    )

plt.legend()
plt.title("Hourly cycling profile per cluster")
plt.xlabel("Hour of day")
plt.ylabel("Avg cyclists")
plt.xticks(range(24))
plt.show()

cluster_names={
    0: "Moderate Routes",
    1: "Heavy Commuter Routes",
    2: "Afternoon Peak Route",
    3: "Low Volume Routes"
}

hourly_profiles["cluster_name"]= hourly_profiles["cluster"].map(cluster_names)
print(hourly_profiles[["cluster","cluster_name"]])