import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";

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
      {route === "home" && <Home />}
      {route === "generate" && <MealPlanGenerator />}
      {route === "signin" && <SignIn />}
      {route === "register" && <SignUp />}
    </>
  );
}

export default App;
