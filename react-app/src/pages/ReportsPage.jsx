import React from "react";
import { Link, useParams } from "react-router-dom";
import DailyReport from "../ReportsComponents/DailyReport";
import MonthlyReport from "../ReportsComponents/MonthlyReport";
import AppsReport from "../ReportsComponents/AppsReport";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";

const Report = ({ children }) => <div>{children}</div>;

const ReportsPage = () => {
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

  const { link } = useParams();
  switch (link) {
    case "daily":
      return (
        <Report>
          <DailyReport />
        </Report>
      );
    case "monthly":
      return (
        <Report>
          <MonthlyReport />
        </Report>
      );
    case "apps":
      return (
        <Report>
          <AppsReport />
        </Report>
      );
    default:
      return (
        <>
          <div class="pagetitle">
            <h1>Reports</h1>
          </div>
          <div class="row">
            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Daily Reports</h5>
                  <p>View daily report</p>
                  <Button
                    as={Link}
                    to="/reports/daily"
                    className="btn btn-primary"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>

            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Monthly Reports</h5>
                  <p>View attendance reports </p>
                  <Button
                    as={Link}
                    to="/reports/monthly"
                    className="btn btn-primary"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Apps</h5>
                  <p>View apps reports </p>
                  <Button
                    as={Link}
                    to="/reports/apps"
                    className="btn btn-primary"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Screenshots </h5>
                  <p>View screenshots reports</p>
                  <Button
                    as={Link}
                    to="/screenshots"
                    className="btn btn-primary"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
  }
};

export default ReportsPage;
