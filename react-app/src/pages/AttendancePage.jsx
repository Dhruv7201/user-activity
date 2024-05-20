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
        <div class="row">
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
            <AttendancePercentage />
          </div>
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
            <LateArrivals />
          </div>
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
            <IdleTime />
          </div>
          <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
            <WorkTime />
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6">
            <AttendancePie />
          </div>
          <div class="col-lg-6">
            <AttendanceBar />
          </div>
        </div>
        <div class="row">
          <div class="col-lg-6">
            <IdleList />
          </div>
          <div class="col-lg-6">
            <LateArrivalsList />
          </div>
        </div>
      </section>
    </>
  );
};

export default AttendancePage;
