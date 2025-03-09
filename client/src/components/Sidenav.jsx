import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import page from "page";
import "./Sidenav.css";

export default function Sidenav() {
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
          <a href="#" className="brand">
            <img src="../icons/logo.svg" />
            <h6>Meal Plan</h6>
          </a>
          <div className="nav-list">
          <a href="#" className="nav-item active" onClick={() => page("/")}>
              <img src="../icons/home.svg" className="icon" />
              <p className="body-m">Dashboard</p>
            </a>
            <a href="#" className="nav-item" onClick={() => page("/profile")}>
              <img src="../icons/user.svg" />
              <p className="body-m">Profile</p>
            </a>
            <a href="#" className="nav-item" onClick={() => page("/settings")}>
              <img src="../icons/setting.svg" />
              <p className="body-m">Settings</p>
            </a>
          </div>
        </div>

        <div className="logout-toggle">
          <div className="dark-mode">
            <div className="nav-item">
              <img src="../icons/moon.svg" />
              <p className="body-m">Dark Mode</p>
            </div>
            <label className="switch">
              <input type="checkbox" />
              <span className="slider round"></span>
            </label>
          </div>
          <button className="logout-btn nav-item" onClick={handleLogout}>
            <img src="../icons/logout.svg" />
            <p className="btn-text">Logout</p>
          </button>
        </div>
        <button className="menu-toggle">
          <img src="../icons/sidebar.svg" />
        </button>
      </div>
    </>
  );
}
