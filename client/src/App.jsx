import { useState, useEffect } from "react";
import useTheme from "./hooks/useTheme";
import page from "page";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import MealInfo from "./MealInfo";
import ProtectedRoute from "./components/ProtectedRoute";
import Forbidden from "./components/Forbidden";
import Sidenav from "./components/Sidenav";

function App() {
  const [route, setRoute] = useState("home");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/generate", () => setRoute("generate"));
    page("/signin", () => setRoute("signin"));
    page("/register", () => setRoute("register"));
    page("/recipe/:id", (ctx) =>
      setRoute({ name: "recipe", id: ctx.params.id })
    );
    page("/forbidden", () => setRoute("forbidden"));
    page("*", () => setRoute("home"));
    page.start();
  }, []);

  return (
    <>
      {route === "home" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <Home />
        </ProtectedRoute>
      )}
      {route === "generate" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <MealPlanGenerator />
        </ProtectedRoute>
      )}
      {route === "signin" && <SignIn />}
      {route === "register" && <SignUp />}
      {route.name === "recipe" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <MealInfo id={route.id} />
        </ProtectedRoute>
      )}
      {route === "forbidden" && (
        <ProtectedRoute>
          <Forbidden />
        </ProtectedRoute>
      )}
    </>
  );
}

export default App;
