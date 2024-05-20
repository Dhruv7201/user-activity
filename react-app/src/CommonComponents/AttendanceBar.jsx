import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const AttendanceBar = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [chartData, setChartData] = useState({});
  const [max, setMax] = useState(0);

  useEffect(() => {
    get(
      `Attendance-Bar?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((response) => {
        setChartData(response.data.data);
        setMax(response.data.max);
      })
      .catch((error) => {
        console.log("Error fetching data:", error);
      });
  }, [fromDateYmd, toDateYmd]);

  const labels = Object.keys(chartData);
  const presentData = labels.map((date) => chartData[date].present);
  const absentData = labels.map((date) => chartData[date].absent);

  const data = {
    labels: labels,
    datasets: [
      {
        name: "Present",
        data: presentData,
        color: "rgb(0, 143, 251)",
      },
      {
        name: "Absent",
        data: absentData,
        color: "rgb(0, 227, 150)",
      },
    ],
  };

  const options = {
    xaxis: {
      categories: labels,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (value) {
          return value + ` (Total: ${max})`;
        },
      },
    },
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">Present and Absent Users</h5>
        <div className="chart">
          <ReactApexChart
            options={options}
            series={data.datasets}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceBar;
