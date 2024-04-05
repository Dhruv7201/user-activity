import React from "react";
import { Card, Col, Container, Row, Button } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import DailyReport from "../ReportsComponents/DailyReport";
import MonthlyReport from "../ReportsComponents/MonthlyReport";
import AppsReport from "../ReportsComponents/AppsReport";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const Report = ({ children }) => <div>{children}</div>;

const ReportsPage = () => {
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
          <Row className="mt-4 mb-4">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Daily Reports</Card.Title>
                  <Card.Text>View daily report</Card.Text>
                  <Button as={Link} to="/reports/daily" className="link-style">
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Monthly Reports</Card.Title>
                  <Card.Text>View attendance reports</Card.Text>
                  <Button
                    as={Link}
                    to="/reports/monthly"
                    className="link-style"
                  >
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Apps</Card.Title>
                  <Card.Text>View apps reports</Card.Text>
                  <Button as={Link} to="/reports/apps" className="link-style">
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Screenshots</Card.Title>
                  <Card.Text>View screenshots reports</Card.Text>
                  <Button as={Link} to="/screenshots" className="link-style">
                    View
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      );
  }
};

export default ReportsPage;
