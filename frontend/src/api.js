// Base URL of the CycloViz backend.
// Set VITE_API_URL in frontend/.env to use another backend (e.g. http://localhost:8000).
// Without it, the app uses the deployed backend on Render.
export const API_URL = import.meta.env.VITE_API_URL || "https://cycloviz-backend.onrender.com"
