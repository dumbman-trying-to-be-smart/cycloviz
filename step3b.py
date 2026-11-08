import numpy as np
import pandas as pd
from collections import Counter
from sklearn.preprocessing import normalize
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.metrics import silhouette_score

df = pd.read_csv("data/total_rides.csv").dropna()
df["road_name"] = df["road_name"].str.split(" (", regex=False).str[0]
df["hour"] = df["time"].str.split("-").str[0].astype(int)

profiles = df.pivot_table(index="road_name", columns="hour", values="n", aggfunc="mean").dropna()
names = list(profiles.index)
X = normalize(profiles.values)

def inertia(labels):
    """Total squared distance of streets to their group centre (lower = tighter groups)."""
    labels = np.array(labels)
    return sum(((X[labels == c] - X[labels == c].mean(axis=0)) ** 2).sum() for c in set(labels))

def groups_of(labels):
    d = {}
    for name, lab in zip(names, labels):
        d.setdefault(lab, []).append(name)
    return sorted(sorted(g) for g in d.values())

def show(title, labels):
    print(title)
    print("   inertia =", round(inertia(labels), 5), "| silhouette =", round(silhouette_score(X, labels), 3))
    for g in groups_of(labels):
        print("   ", g)
    print()

# --- A: the grouping written in your thesis (Section 4.5) ---
thesis_groups = [
    ["Fredensbro", "Jagtvej", "Kalvebod Brygge", "Torvegade", "Vigerslev Allé", "Åboulevard"],
    ["Ellebjergvej", "Englandsvej", "Frederikssundsvej"],
    ["Dr. Louises Bro"],
    ["Hareskovvej", "Roskildevej", "Tuborgvej"],
]
thesis_labels = np.zeros(len(names), dtype=int)
for i, g in enumerate(thesis_groups):
    for s in g:
        thesis_labels[names.index(s)] = i
show("A) Grouping from your thesis", thesis_labels)

# --- B: K-Means with 10 starts (what step3a.py did) ---
km10 = KMeans(n_clusters=4, random_state=42, n_init=10).fit(X)
show("B) K-Means, best of 10 starts", km10.labels_)

# --- C: Ward hierarchical clustering ---
ward = AgglomerativeClustering(n_clusters=4, linkage="ward").fit_predict(X)
show("C) Hierarchical (Ward)", ward)

# --- D: K-Means with ONE start, 100 different seeds ---
counts, info = Counter(), {}
for s in range(100):
    km = KMeans(n_clusters=4, random_state=s, n_init=1).fit(X)
    key = tuple(tuple(g) for g in groups_of(km.labels_))
    counts[key] += 1
    info[key] = (km.inertia_, silhouette_score(X, km.labels_))
print("D) K-Means with a single start, 100 seeds ->", len(counts), "different grouping(s):")
for key, n in counts.most_common():
    print("   found", n, "times | inertia =", round(info[key][0], 5), "| silhouette =", round(info[key][1], 3))
    for g in key:
        print("      ", list(g))