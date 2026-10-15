import sklearn
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.preprocessing import normalize
from sklearn.metrics import silhouette_score

print("scikit-learn version:", sklearn.__version__)

df = pd.read_csv("data/total_rides.csv").dropna()
df["road_name"] = df["road_name"].str.split(" (", regex=False).str[0]
df["hour"] = df["time"].str.split("-").str[0].astype(int)

raw = df.pivot_table(index="road_name", columns="hour", values="n", aggfunc="mean").dropna()
names = list(raw.index)

thesis_groups = [
    ["Fredensbro", "Jagtvej", "Kalvebod Brygge", "Torvegade", "Vigerslev Allé", "Åboulevard"],
    ["Ellebjergvej", "Englandsvej", "Frederikssundsvej"],
    ["Dr. Louises Bro"],
    ["Hareskovvej", "Roskildevej", "Tuborgvej"],
]
thesis_set = {frozenset(g) for g in thesis_groups}

def groups_of(labels):
    d = {}
    for name, lab in zip(names, labels):
        d.setdefault(lab, []).append(name)
    return sorted(sorted(g) for g in d.values())

def inertia(X, labels):
    labels = np.array(labels)
    return sum(((X[labels == c] - X[labels == c].mean(axis=0)) ** 2).sum() for c in set(labels))

def show(title, X, labels):
    same = {frozenset(g) for g in groups_of(labels)} == thesis_set
    print(f"\n{title}")
    print(f"   silhouette = {silhouette_score(X, labels):.3f} | inertia = {inertia(X, labels):.5f} | "
          + ("SAME AS THESIS" if same else "different from thesis"))
    for g in groups_of(labels):
        print("    ", g)

versions = {
    "ROUNDED to whole numbers (as in your clustering.py)": raw.round().astype(int),
    "NOT rounded": raw,
}

for vname, prof in versions.items():
    X = normalize(prof)
    print("\n" + "=" * 70)
    print("PROFILES:", vname)
    show("K-Means exactly as in your clustering.py (random_state=42, default n_init)",
         X, KMeans(n_clusters=4, random_state=42).fit_predict(X))
    show("K-Means with n_init=10",
         X, KMeans(n_clusters=4, random_state=42, n_init=10).fit_predict(X))
    show("Hierarchical (Ward)",
         X, AgglomerativeClustering(n_clusters=4, linkage="ward").fit_predict(X))