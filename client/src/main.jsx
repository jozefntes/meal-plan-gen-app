import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";
import "./assets/fonts/fonts.css";
import './components/SignUp.css'
import App from './App.jsx'
import Home from "./Home.jsx";

const CLIENT_ID = "897780206216-avqvo622dv42vmj5anoqcnrahdvqqtl2.apps.googleusercontent.com"

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <BrowserRouter basename="/">
    <GoogleOAuthProvider clientId = {CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
    </BrowserRouter>


    <Home />
    
  </StrictMode>
);
