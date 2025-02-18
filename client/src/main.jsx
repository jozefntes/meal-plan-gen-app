import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./assets/fonts/fonts.css";
import App from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
