import "./Sidenav.css";

export default function Sidenav() {
  return (
    <>
      <div className="sidenav">
        <div className="brand-nav-list">
          <a href="#" className="brand">
            <img src="../icons/logo.svg" />
            <h6>Meal Plan</h6>
          </a>
          <div className="nav-list">
            <a href="#" className="nav-item active">
              <img src="../icons/home.svg" className="icon" />
              <p className="body-m">Dashboard</p>
            </a>
            <a href="#" className="nav-item">
              <img src="../icons/user.svg" />
              <p className="body-m">Profile</p>
            </a>
            <a href="#" className="nav-item">
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
          <button className="logout-btn nav-item">
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
