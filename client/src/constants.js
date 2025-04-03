export const MAX_WEEK = 3;
export const MIN_WEEK = -2;

export const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8080" // Localhost for development
    : "https://mpgbackend-58007019383.us-central1.run.app"; // Production URL
