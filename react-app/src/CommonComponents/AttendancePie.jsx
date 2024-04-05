import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const AttendancePie = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [chartData, setChartData] = useState({ present: [], absent: [] });

  useEffect(() => {
    get(
      `Attendance-pie?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((response) => {
        setChartData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [fromDateYmd, toDateYmd]);

  const totalPresent = chartData.present.reduce((acc, value) => acc + value, 0);
  const totalAbsent = chartData.absent.reduce((acc, value) => acc + value, 0);

  const data = {
    labels: ["Present", "Absent"],
    series: [totalPresent, totalAbsent],
  };

  const options = {
    labels: ["Present", "Absent"],
    colors: ["rgb(0, 143, 251)", "rgb(0, 227, 150)"],
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value) {
          return value;
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Attendance</h4>
      </div>
      <div className="card-body">
        <div className="chart">
          <ReactApexChart
            options={options}
            series={data.series}
            type="donut"
            height={350}
          />
        </div>
      </div>
      <div className="card-footer">
        <div className="d-flex justify-content-between">
          <div className="stats">
            <a>Present: {totalPresent}</a>
          </div>
          <div className="stats">
            <a>Absent: {totalAbsent}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePie;
