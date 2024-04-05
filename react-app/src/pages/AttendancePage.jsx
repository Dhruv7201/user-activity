import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import DateRange from "../Utils/DateRange";
import AttendancePercentage from "../AttendanceComponents/AttendancePercentage";
import LateArrivals from "../AttendanceComponents/LateArrivals";
import IdleTime from "../AttendanceComponents/IdleTime";
import WorkTime from "../AttendanceComponents/WorkTime";
import AttendancePie from "../CommonComponents/AttendancePie";
import AttendanceBar from "../CommonComponents/AttendanceBar";
import IdleList from "../AttendanceComponents/IdleList";
import LateArrivalsList from "../AttendanceComponents/LateArrivalsList";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const AttendancePage = () => {
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
        <h1>Attendance</h1>
      </div>
      <section class="section dashboard">
        <DateRange />
        <Row>
          <Col>
            <AttendancePercentage />
          </Col>
          <Col>
            <LateArrivals />
          </Col>
          <Col>
            <IdleTime />
          </Col>
          <Col>
            <WorkTime />
          </Col>
        </Row>
        <Row>
          <Col sm={5}>
            <AttendancePie />
          </Col>
          <Col sm={7}>
            <AttendanceBar />
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <IdleList />
          </Col>
          <Col sm={6}>
            <LateArrivalsList />
          </Col>
        </Row>
      </section>
    </>
  );
};

export default AttendancePage;
