import pandas as pd
import numpy as np



from sklearn.preprocessing import normalize
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import silhouette_score,  davies_bouldin_score, adjusted_rand_score
from scipy.cluster.hierarchy import dendrogram, linkage

import matplotlib
matplotlib.use("Agg")
from matplotlib import pyplot as plt

df = pd.read_csv("data/total_rides.csv")
df_clean = df.dropna()

df_clean["hour"] = df_clean["time"].str.split("-").str[0].astype(int)

hourly_profiles = df_clean.pivot_table(
    index= "road_name",
    columns ="hour",
    values="n",
    aggfunc="mean"
).round().astype(int)

streets = hourly_profiles.index.to_list()
X = normalize(hourly_profiles)

print(f"Streets: {len(streets)}")
print(streets)

kmeans= KMeans(n_clusters=4, random_state=42, n_init=10)
kmeans_labels = kmeans.fit_predict(X)
kmeans_sil = silhouette_score(X, kmeans_labels)
kmeans_db = davies_bouldin_score(X, kmeans_labels)

print("\n=== K-Means (k=4) ===")
print(f"Silhouette score: {kmeans_sil:.4f}")
print(f"Davies-Bouldin index: {kmeans_db:.4f}")
for c  in range(4):
    members = [s for s, l in zip(streets, kmeans_labels) if l ==c ]
    print(f"Cluster {c}: {members}")

agg = AgglomerativeClustering(n_clusters=4, linkage="ward")
agg_labels = agg.fit_predict(X)
agg_sil = silhouette_score(X, agg_labels)
agg_db = davies_bouldin_score(X, agg_labels)

print("\n=== Agglomerative Hierarchical Clustering (Ward, k=4) ===")
print(f"Silhouette score: {agg_sil:.4f}")
print(f"Davies-Bouldin index: {agg_db:.4f}")
for c in range(4):
    members = [s for s, l in zip(streets, agg_labels) if l == c]
    print(f"Cluster {c}: {members}")

ari =adjusted_rand_score(kmeans_labels, agg_labels)
print(f"\nAdjusted Rand Index (agreement between methods): {ari:.4f}")

print("\n=== Silhouette score across k for both methods ===")
print(f"{'k':<4}{'K-Means':<12}{'Hierarchical':<12}")
sil_results = {"kmeans": [], "agg": []}
k_range = range(2, 8)
for k in k_range:
    km = KMeans(n_clusters=k, random_state=42, n_init=10).fit(X)
    km_s = silhouette_score(X, km.labels_)
    ag = AgglomerativeClustering(n_clusters=k, linkage="ward").fit(X)
    ag_s = silhouette_score(X, ag.labels_)
    sil_results["kmeans"].append(km_s)
    sil_results["agg"].append(ag_s)
    print(f"{k:<4}{km_s:<12.4f}{ag_s:<12.4f}")

plt.figure(figsize=(7,5))
plt.plot(list(k_range), sil_results["kmeans"], marker="o", label="K-Means")
plt.plot(list(k_range), sil_results["agg"], marker="s", label="Hierarchical (Ward)")
plt.xlabel("Number of clusters (k)")
plt.ylabel("Silhouette score")
plt.title("Silhouette score comparison: K-Means vs Hierarchical Clustering")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.savefig("silhouette_comparison.png", dpi=150)

# ---- Plot: dendrogram ----
plt.figure(figsize=(10,6))
Z = linkage(X, method="ward")
dendrogram(Z, labels=streets, leaf_rotation=90)
plt.title("Hierarchical Clustering Dendrogram (Ward linkage)")
plt.ylabel("Distance")
plt.tight_layout()
plt.savefig("dendrogram.png", dpi=150)
print("Saved dendrogram.png")
 
# ---- Save comparison table ----
comparison = pd.DataFrame({
    "road_name": streets,
    "kmeans_cluster": kmeans_labels,
    "hierarchical_cluster": agg_labels,
})
comparison.to_csv("model_comparison_results.csv", index=False)
print("Saved model_comparison_results.csv")
 
print("\n=== SUMMARY ===")
print(f"K-Means (k=4):       silhouette={kmeans_sil:.4f}, Davies-Bouldin={kmeans_db:.4f}")
print(f"Hierarchical (k=4):  silhouette={agg_sil:.4f}, Davies-Bouldin={agg_db:.4f}")
print(f"Agreement (ARI):     {ari:.4f}")