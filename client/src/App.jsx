import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    page("/", () => setRoute("home"));
    page.start();
  }, []);

  return <>{route === "home" && <Home />}</>;
}

export default App;
