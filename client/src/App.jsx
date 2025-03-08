import { useState, useEffect } from "react";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import MealInfo from "./MealInfo";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [route, setRoute] = useState("home");

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/generate", () => setRoute("generate"));
    page("/signin", () => setRoute("signin"));
    page("/register", () => setRoute("register"));
    page("/recipe/:id", (ctx) =>
      setRoute({ name: "recipe", id: ctx.params.id })
    );
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
      {route.name === "recipe" && (
        <ProtectedRoute>
          <MealInfo id={route.id} />
        </ProtectedRoute>
      )}
    </>
  );
}

export default App;
