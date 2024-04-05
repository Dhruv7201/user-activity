import React from "react";
import { Row, Col } from "react-bootstrap";
import Productivity from "../ProductivityComponents/Productivity";
import AppBarChart from "../ReportsComponents/AppBarChart";
import DateRange from "../Utils/DateRange";

const AppsReport = () => {
  return (
    <>
      <DateRange />
      <Row>
        <Col md={3}>
          <Productivity url="/topApp" title="Top App" />
        </Col>
        <Col md={3}>
          <Productivity url="/topTab" title="Top Tab" />
        </Col>
        <Col md={3}>
          <Productivity url="/topCategory" title="Top Category" />
        </Col>
        <Col md={3}>
          <Productivity url="/topUnproductive" title="Top Unproductive App" />
        </Col>
      </Row>
      <Row className="mt-4 mb-4">
        <Col>
          <AppBarChart />
        </Col>
      </Row>
    </>
  );
};

export default AppsReport;
