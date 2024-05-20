import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../Utils/authUtils";

function NavBar() {
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  document.addEventListener("click", function (event) {
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const profileDropdownToggle = document.querySelector(
      ".nav-link.nav-profile"
    );

    if (
      !dropdownMenu.contains(event.target) &&
      !profileDropdownToggle.contains(event.target)
    ) {
      setProfileDropdownOpen(false);
      dropdownMenu.classList.remove("show");
    }
  });

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    const role = localStorage.getItem("role");
    if (role === "admin") {
      setIsAdmin(true);
    }
    if (
      location.pathname === "/productivity" ||
      location.pathname === "/screenshots" ||
      location.pathname === "/apps"
    ) {
      setAnalyticsOpen(true);
    } else {
      setAnalyticsOpen(false);
    }
    if (location.pathname.includes("/settings")) {
      setSettingsOpen(true);
    } else {
      setSettingsOpen(false);
    }
  }, [location.pathname]);

  const toggleAnalytics = () => {
    setAnalyticsOpen(!isAnalyticsOpen);
  };

  const toggleSettings = () => {
    setSettingsOpen(!isSettingsOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const sidebar = document.getElementById("body");
    sidebar.classList.remove("toggle-sidebar");
  }, []);

  const handleSideBarToggle = () => {
    console.log("clicked");
    const sidebar = document.getElementById("body");
    if (sidebar.classList.contains("toggle-sidebar")) {
      sidebar.classList.remove("toggle-sidebar");
    } else {
      sidebar.classList.add("toggle-sidebar");
    }
  };

  function navigateAll(path) {
    setTimeout(() => {
      navigate(path);
    }, 10);
  }

  return (
    <>
      <header id="header" class="header fixed-top d-flex align-items-center">
        <div class="d-flex align-items-center justify-content-between">
          <Link to="/dashboard" class="logo d-flex align-items-center">
            <img src="assets/img/ethics-logo.png" alt="" />
            <span class="d-none d-lg-block">Ethics Infotech</span>
          </Link>
          <i
            class="bi bi-list toggle-sidebar-btn"
            onClick={handleSideBarToggle}
          ></i>
        </div>

        <nav class="header-nav ms-auto">
          <ul class="d-flex align-items-center">
            <li
              class="nav-item dropdown pe-3"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <a
                class="nav-link nav-profile d-flex align-items-center pe-0"
                style={{ cursor: "pointer", userSelect: "none" }}
                data-bs-toggle="dropdown"
              >
                <img src="/img.webp" alt="Profile" class="rounded-circle" />
                <span class="d-none d-md-block dropdown-toggle ps-2">
                  {username}
                </span>
              </a>
              <ul
                class={`dropdown-menu dropdown-menu-end ${
                  profileDropdownOpen ? "show" : ""
                }`}
              >
                <li>
                  <a
                    class="dropdown-item"
                    style={{ cursor: "pointer", color: "#012970" }}
                  >
                    Profile
                  </a>
                  {isAdmin && (
                    <Link
                      class="dropdown-item"
                      to="/settings"
                      style={{ color: "#012970" }}
                    >
                      Settings
                    </Link>
                  )}
                  <a
                    class="dropdown-item"
                    onClick={handleLogout}
                    style={{ cursor: "pointer", color: "red" }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </header>
      <aside id="sidebar" className="sidebar">
        <ul className="sidebar-nav" id="sidebar-nav">
          <li
            className="nav-item mb-1"
            onClick={() => navigateAll("/dashboard")}
          >
            <Link
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <div className="flex align-items-space-between">
                <i class="bi bi-grid"></i>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li
            className="nav-item mb-1"
            onClick={() => {
              navigateAll("/attendance");
            }}
          >
            <Link
              className={`nav-link ${
                location.pathname === "/attendance" ? "active" : ""
              }`}
            >
              <div className="flex align-items-space-between">
                <i class="bi bi-person-check"></i>
                <span>Attendance</span>
              </div>
            </Link>
          </li>
          <li className={`nav-item mb-1 ${isAnalyticsOpen ? "show" : ""}`}>
            <a
              style={{ cursor: "pointer", userSelect: "none" }}
              className={`nav-link ${isAnalyticsOpen ? "" : "collapsed"}`}
              onClick={toggleAnalytics}
              aria-expanded={isAnalyticsOpen ? "true" : "false"}
              data-bs-target="#analytics-nav"
              data-bs-toggle="collapse"
            >
              <div className="flex align-items-space-between">
                <i class="bi bi-graph-up"></i>

                <span>Analytics</span>
              </div>
              <i class="bi bi-chevron-down ms-auto"></i>
            </a>
            <ul
              id="analytics-nav"
              className={`nav-content collapse `}
              class="nav-content collapse "
              data-bs-parent="#sidebar-nav1"
            >
              <li>
                <Link
                  onClick={() => navigateAll("/productivity")}
                  className={`${
                    location.pathname === "/productivity" ? "active" : ""
                  }`}
                >
                  <i class="bi bi-circle"></i>
                  <span>Productivity</span>
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => navigateAll("/screenshots")}
                  className={`${
                    location.pathname === "/screenshots" ? "active" : ""
                  }`}
                >
                  <i class="bi bi-circle"></i>
                  <span>Screenshots</span>
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => navigateAll("/apps")}
                  className={`${location.pathname === "/apps" ? "active" : ""}`}
                >
                  <i class="bi bi-circle"></i>
                  <span>Apps</span>
                </Link>
              </li>
            </ul>
          </li>

          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname.includes("/reports") ? "active" : ""
              }`}
              onClick={() => navigateAll("/reports")}
            >
              <div className="flex align-items-space-between">
                <i class="bi bi-file-earmark-richtext"></i>
                <span>Reports</span>
              </div>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname.includes("/employee") ? "active" : ""
              }`}
              onClick={() => navigateAll("/employee")}
            >
              <div className="flex align-items-space-between">
                <i class="bi bi-people"></i>
                <span>Employees</span>
              </div>
            </Link>
          </li>
          {isAdmin && (
            <li className="nav-item mb-1">
              <a
                style={{ cursor: "pointer", userSelect: "none" }}
                className={`nav-link ${isSettingsOpen ? "" : "collapsed"}`}
                onClick={toggleSettings}
                aria-expanded={isSettingsOpen ? "true" : "false"}
                data-bs-target="#settings-nav"
                data-bs-toggle="collapse"
              >
                <div className="flex align-items-space-between">
                  <i class="bi bi-gear"></i>
                  <span>Settings</span>
                </div>
                <i class="bi bi-chevron-down ms-auto"></i>
              </a>
              <ul
                id="settings-nav"
                className={`nav-content collapse`}
                class="nav-content collapse"
                data-bs-parent="#sidebar-nav"
              >
                <li>
                  <Link
                    onClick={() => navigateAll("/settings/add-to-group")}
                    className={`${
                      location.pathname === "/settings/add-to-group"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i class="bi bi-circle"></i>
                    <span>Apps Group</span>
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => navigateAll("/settings/unproductive-apps")}
                    className={`${
                      location.pathname === "/settings/unproductive-apps"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i class="bi bi-circle"></i>
                    <span>Unproductive Apps</span>
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => navigateAll("/settings/add-user")}
                    className={`${
                      location.pathname === "/settings/add-user" ? "active" : ""
                    }`}
                  >
                    <i class="bi bi-circle"></i>
                    <span>Add User (Monitoring)</span>
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => navigateAll("/settings/manage-teams")}
                    className={`${
                      location.pathname === "/settings/manage-teams"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i class="bi bi-circle"></i>
                    <span>Manage Teams</span>
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => navigateAll("/settings/manage-users")}
                    className={`${
                      location.pathname === "/settings/manage-users"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i class="bi bi-circle"></i>
                    <span>Manage Users</span>
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </aside>
    </>
  );
}

export default NavBar;
