import React from "react";
import { Row, Col } from "react-bootstrap";
import Productivity from "../ProductivityComponents/Productivity";
import AppBarChart from "../ReportsComponents/AppBarChart";
import DateRange from "../Utils/DateRange";

const AppsReport = () => {
  return (
    <>
      <DateRange />
      <div class="row">
        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
          <Productivity url="/topApp" title="Top App" />
        </div>
        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
          <Productivity url="/topTab" title="Top Tab" />
        </div>
        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
          <Productivity url="/topCategory" title="Top Category" />
        </div>
        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6">
          <Productivity url="/topUnproductive" title="Top Unproductive App" />
        </div>
      </div>
      <div class="row">
        <div class="col-lg-12">
          <AppBarChart />
        </div>
      </div>
    </>
  );
};

export default AppsReport;
