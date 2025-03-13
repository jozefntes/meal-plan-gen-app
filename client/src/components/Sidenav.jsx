import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import page from "page";
import useTheme from "../hooks/useTheme";
import "./Sidenav.css";
import HomeIcon from "../icons/HomeIcon";
import UserIcon from "../icons/UserIcon";
import SettingIcon from "../icons/SettingIcon";
import MoonIcon from "../icons/MoonIcon";
import LogoIcon from "../icons/LogoIcon";
import SidebarIcon from "../icons/SidebarIcon";

export default function Sidenav({ onToggleTheme }) {
  const { theme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

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
          <a href="#" className="brand" onClick={() => page("/")}>
            <LogoIcon />
            <h6>Meal Plan</h6>
          </a>
          <div className="nav-list">
            <a href="#" className="nav-item active" onClick={() => page("/")}>
              <HomeIcon color="var(--icon-color)" />
              <p className="body-m">Dashboard</p>
            </a>
            <a href="#" className="nav-item" onClick={() => page("/profile")}>
              <UserIcon color="var(--icon-color)" />
              <p className="body-m">Profile</p>
            </a>
            <a href="#" className="nav-item" onClick={() => page("/settings")}>
              <SettingIcon color="var(--icon-color)" />
              <p className="body-m">Settings</p>
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
