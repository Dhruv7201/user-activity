import React from "react";
import FileDownloader from "../ScreenShotComponents/FileDownloader";
import DateSelector from "../Utils/DateSelector";
import { Container, Row, Button } from "react-bootstrap";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const Screenshot = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenValid = isTokenValid();

    if (!tokenValid) {
      console.log("Token is not valid. Redirect to login.");
      removeToken();
      navigate("/", {
        state: { error: "Session expired. Please log in again." },
      });
    }
  }, [navigate]);

  return (
    <>
      <div class="pagetitle">
        <h1>Screenshots</h1>
      </div>
      <DateSelector />
      <FileDownloader />
    </>
  );
};

export default Screenshot;
