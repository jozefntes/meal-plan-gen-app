import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";

function App() {
  // const [route, setRoute] = useState("home");
  const [route, setRoute] = useState({ name: "home", uid: null });

  // useEffect(() => {
  //   page("/", () => setRoute("home"));
  //   page("/generate", () => setRoute("generate"));
  //   page.start();
  // }, []);
  useEffect(() => {
    page("/", () => setRoute({ name: "home", uid: null }));
    page("/home", (ctx) => {
      const uid = new URLSearchParams(ctx.querystring).get("uid");
      setRoute({ name: "home", uid });
    });
    page("/generate", (ctx) => {
      const uid = new URLSearchParams(ctx.querystring).get("uid");
      setRoute({ name: "generate", uid });
    });
    page.start();
  }, []);

  return (
    <>
      {/* {route === "home" && <Home />}
      {route === "generate" && <MealPlanGenerator />} */}
      {route.name === "home" && <Home uid={route.uid} />}
      {route.name === "generate" && <MealPlanGenerator uid={route.uid} />}
    </>
  );
}

export default App;
