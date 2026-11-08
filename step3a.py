import pandas as pd
from sklearn.preprocessing import normalize
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

df = pd.read_csv("data/total_rides.csv").dropna()
df["road_name"] = df["road_name"].str.split(" (", regex=False).str[0]
df["hour"] = df["time"].str.split("-").str[0].astype(int)

profiles = df.pivot_table(index="road_name", columns="hour", values="n", aggfunc="mean").dropna()
X = normalize(profiles.values)

labels = KMeans(n_clusters=4, random_state=42, n_init=10).fit_predict(X)
print("Silhouette:", round(silhouette_score(X, labels), 3))

groups = pd.Series(labels, index=profiles.index)
for c in sorted(groups.unique()):
    print("Group", c, ":", list(groups[groups == c].index))