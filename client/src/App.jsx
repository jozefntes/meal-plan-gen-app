import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/generate", () => setRoute("generate"));
    page("/signin", () => setRoute("signin"));
    page("/register", () => setRoute("register"));
    page.start();
  }, []);

  return (
    <>
      {route === "home" && (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      )}
      {route === "generate" && (
        <ProtectedRoute>
          <MealPlanGenerator />
        </ProtectedRoute>
      )}
      {route === "signin" && <SignIn />}
      {route === "register" && <SignUp />}
    </>
  );
}

export default App;
