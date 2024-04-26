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
  // Add an event listener to detect clicks on the document
  // Add an event listener to detect clicks on the document
  document.addEventListener("click", function (event) {
    // Check if the clicked element is outside the dropdown menu
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const profileDropdownToggle = document.querySelector(
      ".nav-link.nav-profile"
    );

    if (
      !dropdownMenu.contains(event.target) &&
      !profileDropdownToggle.contains(event.target)
    ) {
      // If the clicked element is outside the dropdown menu and profile dropdown toggle, close the dropdown
      setProfileDropdownOpen(false); // Update the state to close the dropdown
      dropdownMenu.classList.remove("show");
    }
  });

  //set time out of 1 second then get the role from local storage
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

  return (
    <>
      <header id="header" class="header fixed-top d-flex align-items-center">
        <div class="d-flex align-items-center justify-content-between">
          <Link to="/dashboard" class="logo d-flex align-items-center">
            <img src="./src/assets/img/ethics-logo.png" alt="" />
            <span class="d-none d-lg-block">Ethics Infotech</span>
          </Link>
          <i class="bi bi-list toggle-sidebar-btn"></i>
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
          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
              to="/dashboard"
            >
              <div className="flex align-items-space-between">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-house"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname === "/attendance" ? "active" : ""
              }`}
              to="/attendance"
            >
              <div className="flex align-items-space-between">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-activity"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2"
                  />
                </svg>
                <span>Attendance</span>
              </div>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <a
              style={{ cursor: "pointer", userSelect: "none" }}
              className={`nav-link ${
                isAnalyticsOpen ? "" : "collapsed"
              } justify-content-between`}
              onClick={toggleAnalytics}
              aria-expanded={isAnalyticsOpen ? "true" : "false"}
            >
              <div className="flex align-items-space-between">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-graph-up-arrow"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M0 0h1v15h15v1H0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5"
                  />
                </svg>

                <span>Analytics</span>
              </div>
              {isAnalyticsOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="512"
                  height="512"
                  // make this on right side of div and center vertically
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                >
                  <g id="_01_align_center" data-name="01 align center">
                    <path d="M17.293,15.207,12,9.914,6.707,15.207,5.293,13.793,10.586,8.5a2,2,0,0,1,2.828,0l5.293,5.293Z" />
                  </g>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="512"
                  height="512"
                  style={{
                    height: "1rem",
                    width: "1rem",
                  }}
                >
                  <g id="_01_align_center" data-name="01 align center">
                    <path d="M12,15.5a1.993,1.993,0,0,1-1.414-.585L5.293,9.621,6.707,8.207,12,13.5l5.293-5.293,1.414,1.414-5.293,5.293A1.993,1.993,0,0,1,12,15.5Z" />
                  </g>
                </svg>
              )}
            </a>
            <ul
              id="analytics-nav"
              className={`nav-content ${isAnalyticsOpen ? "show" : "hide"}`}
              data-bs-parent="#sidebar-nav"
            >
              <div className="side-item">
                <li>
                  <Link
                    to="/productivity"
                    className={`${
                      location.pathname === "/productivity" ? "active" : ""
                    }`}
                  >
                    <span>Productivity</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/screenshots"
                    className={`${
                      location.pathname === "/screenshots" ? "active" : ""
                    }`}
                  >
                    <span>Screenshots</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/apps"
                    className={`${
                      location.pathname === "/apps" ? "active" : ""
                    }`}
                  >
                    <span>Apps</span>
                  </Link>
                </li>
              </div>
            </ul>
          </li>
          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname.includes("/reports") ? "active" : ""
              }`}
              to="/reports"
            >
              <div className="flex align-items-space-between">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-file-earmark"
                  viewBox="0 0 16 16"
                >
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z" />
                </svg>
                <span>Reports</span>
              </div>
            </Link>
          </li>
          <li className="nav-item mb-1">
            <Link
              className={`nav-link ${
                location.pathname === "/employee" ? "active" : ""
              }`}
              to="/employee"
            >
              <div className="flex align-items-space-between">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-people"
                  viewBox="0 0 16 16"
                >
                  <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                </svg>
                <span>Employees</span>
              </div>
            </Link>
          </li>
          {isAdmin && (
            <li className="nav-item mb-1">
              <a
                style={{ cursor: "pointer", userSelect: "none" }}
                className={`nav-link ${
                  isSettingsOpen ? "" : "collapsed"
                } justify-content-between`}
                onClick={toggleSettings}
                aria-expanded={isSettingsOpen ? "true" : "false"}
              >
                <div className="flex align-items-space-between">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-gear"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                  </svg>
                  <span>Settings</span>
                </div>
                {isSettingsOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="512"
                    height="512"
                    // make this on right side of div and center vertically
                    style={{
                      height: "1rem",
                      width: "1rem",
                    }}
                  >
                    <g id="_01_align_center" data-name="01 align center">
                      <path d="M17.293,15.207,12,9.914,6.707,15.207,5.293,13.793,10.586,8.5a2,2,0,0,1,2.828,0l5.293,5.293Z" />
                    </g>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="512"
                    height="512"
                    style={{
                      height: "1rem",
                      width: "1rem",
                    }}
                  >
                    <g id="_01_align_center" data-name="01 align center">
                      <path d="M12,15.5a1.993,1.993,0,0,1-1.414-.585L5.293,9.621,6.707,8.207,12,13.5l5.293-5.293,1.414,1.414-5.293,5.293A1.993,1.993,0,0,1,12,15.5Z" />
                    </g>
                  </svg>
                )}
              </a>
              <ul
                id="analytics-nav"
                className={`nav-content collapse ${
                  isSettingsOpen ? "show" : "hide"
                }`}
                data-bs-parent="#sidebar-nav"
              >
                <div className="side-item">
                  <li>
                    <Link
                      to="/settings/add-to-group"
                      className={`${
                        location.pathname === "/settings/add-to-group"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span>Apps Group</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings/unproductive-apps"
                      className={`${
                        location.pathname === "/settings/unproductive-apps"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span>Unproductive Apps</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings/add-user"
                      className={`${
                        location.pathname === "/settings/add-user"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span>Add User (Monitoring)</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings/manage-teams"
                      className={`${
                        location.pathname === "/settings/manage-teams"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span>Manage Teams</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/settings/manage-users"
                      className={`${
                        location.pathname === "/settings/manage-users"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span>Manage Users</span>
                    </Link>
                  </li>
                </div>
              </ul>
            </li>
          )}
        </ul>
      </aside>
    </>
  );
}

export default NavBar;
