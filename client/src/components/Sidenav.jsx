import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import page from "page";
import useTheme from "../hooks/useTheme";
import "./Sidenav.css";
import HomeIcon from "../icons/HomeIcon";
import UserIcon from "../icons/UserIcon";
import MoonIcon from "../icons/MoonIcon";
import SidebarIcon from "../icons/SidebarIcon";
import ChefHatIcon from "../icons/ChefHatIcon";
import CalendarIcon from "../icons/CalendarIcon";

export default function Sidenav({ onToggleTheme }) {
  const { theme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

  useEffect(() => {
    const handleRouteChange = (path) => {
      setCurrentPath(path);
    };

    page("*", (ctx, next) => {
      handleRouteChange(ctx.path);
      next();
    });
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      page("/signin");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="sidenav">
        <div className="brand-nav-list">
          <a href="/" className="brand">
            <img
              src={theme === "dark" ? "/logo-dark.svg" : "/logo-light.svg"}
              alt="MacroMate Logo"
            />
            <h6>MacroMate</h6>
          </a>
          <div className="nav-list">
            <a
              href="/"
              className={`nav-item ${currentPath === "/" ? "active" : ""}`}
            >
              <HomeIcon color="var(--icon-color)" />
              <p className="body-m">Dashboard</p>
            </a>
            <a
              href="/myrecipes"
              className={`nav-item ${
                currentPath === "/myrecipes" ||
                currentPath.startsWith("/recipe/")
                  ? "active"
                  : ""
              }`}
            >
              <ChefHatIcon color="var(--icon-color)" />
              <p className="body-m">My Recipes</p>
            </a>
            <a
              href="/generate"
              className={`nav-item ${
                currentPath === "/generate" ? "active" : ""
              }`}
            >
              <CalendarIcon color="var(--icon-color)" />
              <p className="body-m">Generate Plan</p>
            </a>
            <a
              href="/profile"
              className={`nav-item ${
                currentPath === "/profile" ? "active" : ""
              }`}
            >
              <UserIcon color="var(--icon-color)" />
              <p className="body-m">Profile</p>
            </a>
          </div>
        </div>

        <div className="logout-toggle">
          <div className="dark-mode">
            <div className="nav-item">
              <MoonIcon />
              <p className="body-m">Dark Mode</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={onToggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <button className="logout-btn nav-item" onClick={handleLogout}>
            <img src="../icons/logout.svg" />
            <p className="btn-text">Logout</p>
          </button>
        </div>
        <button className="menu-toggle">
          <SidebarIcon color="var(--icon-color)" />
        </button>
      </div>
    </>
  );
}
