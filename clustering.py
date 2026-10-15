"""
clustering.py - reproducible K-Means clustering for CycloViz

What is different from the old version:
  * n_init=10 and a fixed random_state, so the result is the best of 10 starts and always the same
  * no rounding of the hourly profiles
  * cluster NAMES are attached through anchor streets, not through cluster numbers
  * prints the shape of every cluster, so you can name clusters from evidence
  * k = 2..7 comparison table (K-Means and Ward) saved to data/k_comparison.csv
  * writes data/clusters_new.csv (it does NOT overwrite data/clusters.csv)
"""
import pandas as pd
from matplotlib import pyplot as plt
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.preprocessing import normalize
from sklearn.metrics import silhouette_score, davies_bouldin_score, adjusted_rand_score

K = 4
SEED = 42
N_INIT = 100
SHOW_PLOTS = False   # True opens plot windows (they pause the script until you close them)

# One anchor street per cluster + the name that cluster gets.
# The anchors must end up in four DIFFERENT clusters (the script checks this).
# Edit the TODO names after reading the "Shape of each cluster" table printed below.
ANCHORS = [
    ("Torvegade",       "Balanced Commuter Routes"),
    ("Dr. Louises Bro", "Afternoon-Evening Route"),
    ("Hareskovvej",     "Rush-Hour Route"),
    ("Ellebjergvej",    "Afternoon-Leaning Commuter Routes"),
]

# ---------- load and build hourly profiles ----------
df = pd.read_csv("data/total_rides.csv").dropna()
df["hour"] = df["time"].str.split("-").str[0].astype(int)

profiles = df.pivot_table(index="road_name", columns="hour", values="n", aggfunc="mean")
if profiles.isna().any().any():
    raise SystemExit("Some street has no data for some hour - check the data before clustering.")
X = normalize(profiles)          # shape of the day, not volume
street_list = list(profiles.index)

def find_street(prefix):
    """Find the full street name that starts with the given text."""
    hits = [s for s in street_list if s.startswith(prefix)]
    if len(hits) != 1:
        raise SystemExit(f"Anchor street '{prefix}' matched {len(hits)} streets: {hits}")
    return hits[0]

# ---------- how many clusters? K-Means vs Ward for k = 2..7 ----------
rows = []
for k in range(2, 8):
    km_k = KMeans(n_clusters=k, random_state=SEED, n_init=N_INIT).fit(X)
    ward_k = AgglomerativeClustering(n_clusters=k, linkage="ward").fit_predict(X)
    rows.append({
        "k": k,
        "inertia": km_k.inertia_,
        "silhouette_kmeans": silhouette_score(X, km_k.labels_),
        "davies_bouldin_kmeans": davies_bouldin_score(X, km_k.labels_),
        "silhouette_ward": silhouette_score(X, ward_k),
        "agreement_kmeans_vs_ward_ARI": adjusted_rand_score(km_k.labels_, ward_k),
    })
k_table = pd.DataFrame(rows).set_index("k").round(4)
pd.set_option("display.width", 200)
pd.set_option("display.max_columns", None)
print("=== K-Means vs Ward for different k ===")
print(k_table)
k_table.to_csv("data/k_comparison.csv")

fig, ax = plt.subplots(1, 2, figsize=(11, 4))
ax[0].plot(k_table.index, k_table["inertia"], marker="o")
ax[0].set_title("Elbow method (K-Means, best of 10 starts)")
ax[0].set_xlabel("Number of clusters (k)")
ax[0].set_ylabel("Inertia")
ax[1].plot(k_table.index, k_table["silhouette_kmeans"], marker="o", label="K-Means")
ax[1].plot(k_table.index, k_table["silhouette_ward"], marker="s", label="Ward")
ax[1].set_title("Silhouette score")
ax[1].set_xlabel("Number of clusters (k)")
ax[1].set_ylabel("Silhouette")
ax[1].legend()
plt.tight_layout()
plt.savefig("data/plot_k_selection.png", dpi=200)
if SHOW_PLOTS:
    plt.show()
plt.close()

# ---------- final clustering ----------
km = KMeans(n_clusters=K, random_state=SEED, n_init=N_INIT).fit(X)

# attach names and stable cluster numbers through the anchor streets
anchor_streets = [find_street(a) for a, _ in ANCHORS]
anchor_labels = [km.labels_[street_list.index(s)] for s in anchor_streets]
if len(set(anchor_labels)) != K:
    print("\nSTOP: the anchor streets did not land in four different clusters:")
    for s, lab in zip(anchor_streets, anchor_labels):
        print("   ", s, "-> K-Means label", lab)
    raise SystemExit("Choose different anchor streets (one per cluster) and run again.")

relabel = {old: new for new, old in enumerate(anchor_labels)}
names = {i: name for i, (_, name) in enumerate(ANCHORS)}
result = pd.DataFrame({"cluster": [relabel[l] for l in km.labels_]}, index=profiles.index)
result["cluster_name"] = result["cluster"].map(names)

print("\n=== Final clusters ===")
print(f"Silhouette (k={K}): {silhouette_score(X, km.labels_):.3f}")
for c in range(K):
    members = [s.split(" (")[0] for s in result.index[result["cluster"] == c]]
    print(f"Cluster {c} - {names[c]}: {members}")

# ---------- shape of each cluster (use this to choose names) ----------
share = profiles.div(profiles.sum(axis=1), axis=0)     # each street's day as shares of its own total
summary = []
for c in range(K):
    members = result.index[result["cluster"] == c]
    shape = share.loc[members].mean()
    raw = profiles.loc[members]
    summary.append({
        "cluster": c,
        "name": names[c],
        "streets": len(members),
        "avg_cyclists_per_hour": round(raw.values.mean()),
        "peak_hour": int(shape.idxmax()),
        "peak_hour_share_%": round(100 * shape.max(), 1),
        "share_7-9_and_15-17_%": round(100 * shape[[7, 8, 9, 15, 16, 17]].sum(), 1),
        "pm_peak_/_am_peak": round(raw[16].mean() / raw[8].mean(), 2),
    })
print("\n=== Shape of each cluster ===")
print(pd.DataFrame(summary).set_index("cluster").to_string())

# ---------- plots ----------
cluster_profiles = profiles.groupby(result["cluster"]).mean()
cluster_shapes = share.groupby(result["cluster"]).mean()
fig, ax = plt.subplots(1, 2, figsize=(13, 4.5))
for c in range(K):
    ax[0].plot(range(24), cluster_profiles.loc[c], marker="o", label=f"{c}: {names[c]}")
    ax[1].plot(range(24), 100 * cluster_shapes.loc[c], marker="o", label=f"{c}: {names[c]}")
ax[0].set_title("Average cyclists per hour (volume)")
ax[1].set_title("Share of the day's traffic (shape - what K-Means uses)")
for a in ax:
    a.set_xlabel("Hour of day")
    a.set_xticks(range(0, 24, 2))
ax[0].set_ylabel("Avg cyclists")
ax[1].set_ylabel("% of daily total")
ax[0].legend(fontsize=7)
plt.tight_layout()
plt.savefig("data/plot_cluster_profiles.png", dpi=200)
if SHOW_PLOTS:
    plt.show()
plt.close()

# ---------- save ----------
result.to_csv("data/clusters_new.csv")
print("\nSaved data/clusters_new.csv (data/clusters.csv was NOT changed)")
if any("TODO" in n for n in names.values()):
    print("REMINDER: replace the TODO names in ANCHORS, run again, then use the new file.")