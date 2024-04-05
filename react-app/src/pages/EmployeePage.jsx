import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import DateTimeSelector from "../Utils/DateTimeSelector";
import EmployeeList from "../EmployeeComponents/EmployeeList";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

function EmployeePage() {
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
        <h1>Employee Details</h1>
      </div>
      <DateTimeSelector />
      <Row className="mt-4 mb-4">
        <Col>
          <EmployeeList />
        </Col>
      </Row>
    </>
  );
}

export default EmployeePage;
