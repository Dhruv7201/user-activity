import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

function Error() {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenValid = isTokenValid();

    if (!tokenValid) {
      removeToken();
      navigate("/", {
        state: { error: "Session expired. Please log in again." },
      });
    }
  }, [navigate]);

  return (
    <div class="container">
      <section class="section error-404 min-vh-50 d-flex flex-column align-items-center justify-content-center">
        <h1>404</h1>
        <h2>The page you are looking for doesn't exist.</h2>
        <a
          class="btn"
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Back to home
        </a>
        <img
          src="assets/img/not-found.svg"
          class="img-fluid py-5"
          alt="Page Not Found"
        />
      </section>
    </div>
  );
}

export default Error;
