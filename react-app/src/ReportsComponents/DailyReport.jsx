import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Table } from "react-bootstrap";
import { get } from "../api/api";
import DateSelector from "../Utils/DateSelector";
import { useDateContext } from "../Context/DateContext.jsx";

const DailyReport = () => {
  const [data, setData] = useState([]);
  const { dateYmd } = useDateContext();

  useEffect(() => {
    if (!dateYmd) {
      return;
    }
    get(
      "dailyreport/?date=" +
        dateYmd +
        "&teamname=" +
        localStorage.getItem("teamname")
    )
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {});
  }, [dateYmd]);
  return (
    <>
      <div class="pagetitle">
        <h1>Reports</h1>
      </div>
      <DateSelector />
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Arrival</th>
                    <th>Working Time</th>
                    <th>Productive Time</th>
                    <th>Idle Time</th>
                    <th>Total Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          to={`/employee/${item["Employee Name"]}`}
                          className="link-style"
                        >
                          {item["Employee Name"]}
                        </Link>
                      </td>
                      <td>{item.Arrival}</td>
                      <td>{item["Working Time"]}</td>
                      <td>{item["Productive Time"]}</td>
                      <td>{item["Idle Time"]}</td>
                      <td>{item["Total Time"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyReport;
