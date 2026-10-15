import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

print("Script started")

df = pd.read_csv("data/total_rides.csv")
print("Rows loaded:", df.shape[0])

df = df.dropna()
df["date"] = pd.to_datetime(df["date"])
df["year"] = df["date"].dt.year

coverage = (
    df.groupby(["road_name", "year"]).size()
    .unstack(fill_value=0)
    .reindex(columns=range(2005, 2015), fill_value=0)
)

# 24 hours x 365 days = 8760 possible hourly rows in a full year
coverage_pct = (coverage / 8760 * 100).round(0)

pd.set_option("display.width", 200)
pd.set_option("display.max_columns", None)
print(coverage_pct)

plt.figure(figsize=(10, 6))
sns.heatmap(coverage_pct, annot=True, fmt=".0f", cmap="Blues", vmin=0, vmax=100,
            cbar_kws={"label": "Coverage (%)"})
plt.title("Data coverage per sensor per year (%)")
plt.xlabel("Year")
plt.ylabel("Street")
plt.tight_layout()
plt.savefig("data/plot_coverage.png", dpi=200)   # saves first, so you always get the file
print("Saved data/plot_coverage.png")
plt.show()