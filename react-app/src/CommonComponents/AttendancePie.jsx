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
        console.log(response.data);
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
      <div className="card-body">
        <h5 className="card-title">Attendance</h5>
        <div className="chart">
          <ReactApexChart
            options={options}
            series={data.series}
            type="donut"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendancePie;
