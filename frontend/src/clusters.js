// Display settings for each cluster, keyed by the cluster name in data/clusters.csv.
// Which street belongs to which cluster comes from the backend; this file only decides how a cluster looks.
// If clustering.py produces a new name that is not listed here, the app still works and uses DEFAULT_STYLE.
export const CLUSTER_STYLES = {
  "Balanced Commuter Routes": {
    short: "Balanced Commuter",
    color: "#185FA5",   // map marker / dot
    bg: "#E6F1FB",      // header background
    text: "#1B3A5C",    // header text
    description: "Morning and afternoon peaks of about equal size",
  },
  "Afternoon-Evening Route": {
    short: "Afternoon-Evening",
    color: "#0F6E56",
    bg: "#E6F4EE",
    text: "#085041",
    description: "Small morning peak, large afternoon peak and busier evenings",
  },
  "Rush-Hour Route": {
    short: "Rush-Hour",
    color: "#EF9F27",
    bg: "#FEF6E4",
    text: "#7A4F00",
    description: "Sharp peaks around 07:00 and 16:00, very little traffic at night",
  },
  "Afternoon-Leaning Commuter Routes": {
    short: "Afternoon-Leaning",
    color: "#7B5EA7",
    bg: "#EFEAF8",
    text: "#4B3478",
    description: "Commuter pattern with a slightly larger afternoon peak",
  },
}

export const DEFAULT_STYLE = { color: "#888888", bg: "#F2F2F2", text: "#444444", description: "" }

export function clusterStyle(name) {
  return { short: name, ...DEFAULT_STYLE, ...CLUSTER_STYLES[name] }
}
