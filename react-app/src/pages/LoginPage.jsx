import React, { useState } from "react";
import { post } from "../api/api.js";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { setToken } from "../Utils/authUtils.js";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      localStorage.clear();
      const response = await post("token", {
        username,
        password,
      });

      if (response.data.access_token) {
        console.log(response.data);
        setToken(response.data.access_token);
        localStorage.setItem("username", username);
        localStorage.setItem("teamname", response.data.teamname);
        if (response.data.teamname.includes("admin")) {
          localStorage.setItem("role", "admin");
        }
        setLoading(true);
        navigate("/dashboard");
      } else {
        setResponseMessage("Invalid username or password");
      }
    } catch (error) {
      console.error(error);
      setResponseMessage(
        "Sorry, something went wrong. Please try again later."
      );
    }
  };
  // center the container in middle of vertical and horizontal
  return (
    <div className="container mt-5">
      <div className="row justify-content-center align-items-center">
        <div className="col-lg-5 mt-5">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header">
              <h3 className="text-center font-weight-light my-4">Login</h3>
            </div>
            <div className="card-body">
              <div className="text-center">
                <Link to="/">
                  <img
                    className="logo-img"
                    src="./logo.png"
                    alt="logo"
                    style={{ width: "200px", height: "auto" }}
                  />
                </Link>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="Username"
                    required
                    autoFocus
                    value={username}
                    onChange={handleUsernameChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                  <button type="submit" className="btn btn-primary">
                    {loading ? "Loading..." : "Login"}
                  </button>
                </div>
              </form>
              {responseMessage && (
                <div className="alert alert-danger" role="alert">
                  {responseMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
