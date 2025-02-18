import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/generate", () => setRoute("generate"));
    page.start();
  }, []);

  return (
    <>
      {route === "home" && <Home />}
      {route === "generate" && <MealPlanGenerator />}
    </>
  );
}

export default App;
