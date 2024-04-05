import React from "react";
import { Col, Container, Row, Button } from "react-bootstrap";
import DateSelector from "../Utils/DateSelector";
import { useParams } from "react-router-dom";
import EmployeeList from "../EmployeeComponents/EmployeeList";

function EmployeeDetailsPage() {
  const { name } = useParams();
  return (
    <>
      <div class="pagetitle">
        <h1>Employee Details</h1>
      </div>
      <Row>
        <DateSelector />
      </Row>
      <Row>
        <Col>
          <EmployeeList />
        </Col>
      </Row>
    </>
  );
}

export default EmployeeDetailsPage;
