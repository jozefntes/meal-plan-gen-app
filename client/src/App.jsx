import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import Create from "./Create";

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/create", () => setRoute("create"));
    page.start();
  }, []);

  return (
    <>
      {route === "home" && <Home />}
      {route === "create" && <Create />}
    </>
  );
}

export default App;
