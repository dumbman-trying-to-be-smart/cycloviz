"""
check_robustness.py - do the data gaps change the four clusters?
Uses the same settings as clustering.py (best of 10 starts, no rounding).
"""
import pandas as pd
from collections import Counter
from sklearn.preprocessing import normalize
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, adjusted_rand_score

K = 4
SEED = 42
N_INIT = 10
MIN_MONTH_COVERAGE = 0.8   # a sensor-month is "well covered" if at least 80% of its hours exist

df = pd.read_csv("data/total_rides.csv").dropna()
df["hour"] = df["time"].str.split("-").str[0].astype(int)
df["date"] = pd.to_datetime(df["date"])
df["year"] = df["date"].dt.year
df["month"] = df["date"].dt.month

def short(name):
    return name.split(" (")[0]

def profiles_all(data):
    """Average cyclists per hour of day, one row per street."""
    return data.pivot_table(index="road_name", columns="hour", values="n", aggfunc="mean")

def profiles_month_balanced(data):
    """Average each calendar month first, then average the months (every month counts equally)."""
    per_month = data.pivot_table(index=["road_name", "month"], columns="hour", values="n", aggfunc="mean")
    return per_month.groupby("road_name").mean()

def run_kmeans(profiles, seed=SEED):
    profiles = profiles.dropna()
    X = normalize(profiles)
    labels = KMeans(n_clusters=K, random_state=seed, n_init=N_INIT).fit_predict(X)
    return pd.Series(labels, index=profiles.index), silhouette_score(X, labels)

def partition(series, streets):
    groups = {}
    for street in streets:
        groups.setdefault(series[street], set()).add(street)
    return {frozenset(g) for g in groups.values()}

def show_groups(series):
    groups = {}
    for street, lab in series.items():
        groups.setdefault(lab, []).append(short(street))
    for g in sorted(sorted(x) for x in groups.values()):
        print("      ", g)

results = []

# ---------- CHECK 0: baseline ----------
base_prof = profiles_all(df)
base, base_sil = run_kmeans(base_prof)
print("=== CHECK 0: baseline (same as clustering.py) ===")
print(f"Silhouette: {base_sil:.3f}   <- should be about 0.269")
show_groups(base)

def compare(title, new, sil):
    common = base.index.intersection(new.index)
    same = partition(base, common) == partition(new, common)
    ari = adjusted_rand_score(base[common], new[common])
    dropped = [short(s) for s in base.index.difference(new.index)]
    print(f"\n{title}")
    print(f"   silhouette = {sil:.3f} | agreement with baseline (ARI) = {ari:.2f}   (1.00 = identical)")
    if dropped:
        print("   streets left out (not enough data):", dropped)
    if same:
        print("   RESULT: same groups as the baseline")
    else:
        print("   RESULT: groups CHANGED. New groups:")
        show_groups(new)
    results.append(("same" if same else "CHANGED", round(ari, 2), title))

# ---------- CHECK 1: different random starts ----------
print("\n=== CHECK 1: 50 different random seeds ===")
parts = Counter()
for s in range(50):
    lab, _ = run_kmeans(base_prof, seed=s)
    parts[frozenset(partition(lab, lab.index))] += 1
print("Different groupings found:", len(parts), "| counts:", sorted(parts.values(), reverse=True))
base_part = frozenset(partition(base, base.index))
results.append(("same" if len(parts) == 1 and base_part in parts else "CHANGED",
                1.0 if len(parts) == 1 else round(parts[base_part] / 50, 2),
                "50 random seeds (second number = share of runs giving the baseline)"))

# ---------- CHECK 2: only well-covered sensor-months ----------
print("\n=== CHECK 2: only months with at least 80% of the hours recorded ===")
cell = df.groupby(["road_name", "year", "month"]).size().reset_index(name="rows")
cell["possible"] = pd.to_datetime(cell[["year", "month"]].assign(day=1)).dt.days_in_month * 24
good = cell[cell["rows"] / cell["possible"] >= MIN_MONTH_COVERAGE][["road_name", "year", "month"]]
kept = good.groupby("road_name").size().reindex(base.index, fill_value=0)
print("Well-covered months kept per street:")
print(kept.rename(index=short).to_string())
if good.empty:
    print("No month reached 80% coverage - lower MIN_MONTH_COVERAGE at the top of the script.")
else:
    df_good = df.merge(good, on=["road_name", "year", "month"])
    lab, sil = run_kmeans(profiles_all(df_good))
    compare("Well-covered months only", lab, sil)

# ---------- CHECK 3: every calendar month counts equally ----------
print("\n=== CHECK 3: every calendar month counts equally ===")
lab, sil = run_kmeans(profiles_month_balanced(df))
compare("Month-balanced profiles", lab, sil)

# ---------- summary ----------
print("\n=== SUMMARY ===")
for verdict, ari, title in results:
    print(f"{verdict:8} | {ari:<5} | {title}")
print("\n'same' = the four groups did not change, so the data gaps did not affect them.")
print("'CHANGED' = look at which streets moved; that is something to report in the thesis.")