import React, { useEffect } from "react";
import DateRange from "../Utils/DateRange";
import AttendancePie from "../CommonComponents/AttendancePie";
import AttendanceBar from "../CommonComponents/AttendanceBar";
import MostProductiveUser from "../DashBoardComponents/MostProductiveUser";
import MostActiveUser from "../DashBoardComponents/MostActiveUser";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
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
        <h1>Dashboard</h1>
      </div>
      <section class="section dashboard">
        <DateRange />
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
            <MostProductiveUser />
          </div>
          <div class="col-lg-6">
            <MostActiveUser />
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;
