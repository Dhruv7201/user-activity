import React, { useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import AppData from "../AppsComponents/AppData";
import DateRange from "../Utils/DateRange";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const AppsPage = () => {
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
    <>
      <div class="pagetitle">
        <h1>Used Applications</h1>
      </div>
      <DateRange />
      <AppData />
    </>
  );
};

export default AppsPage;
