import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const AppBarChart = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    get(
      `appBar?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((response) => {
        setChartData(response.data.top_seven_group);
      })
      .catch((error) => {});
  }, [fromDateYmd, toDateYmd]);

  const colors = [
    "rgba(54, 162, 235, 0.6)",
    "rgba(255, 99, 132, 0.6)",
    "rgba(255, 206, 86, 0.6)",
    "rgba(75, 192, 192, 0.6)",
    "rgba(153, 102, 255, 0.6)",
    "rgba(180, 19, 104, 0.6)",
    "rgba(255, 159, 64, 0.6)",
  ];

  const borderColor = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(180, 19, 104, 1)",
    "rgba(255, 159, 64, 1)",
  ];

  const appsData = {
    labels: Object.keys(chartData),
    datasets: [
      {
        label: "Usage Duration",
        data: Object.values(chartData).map((duration, index) => {
          // Convert duration to seconds
          const durationInSeconds = duration
            .split(":")
            .reduce((acc, time, index) => {
              return (
                acc +
                parseInt(time) *
                  Math.pow(60, duration.split(":").length - 1 - index)
              );
            }, 0);

          return durationInSeconds;
        }),
        backgroundColor: colors,
        borderColor: borderColor,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            // Convert seconds to HH:MM:SS format
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = value % 60;

            return `${String(hours).padStart(2, "0")}:${String(
              minutes
            ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            // Convert seconds to HH:MM:SS format
            const hours = Math.floor(context.parsed.y / 3600);
            const minutes = Math.floor((context.parsed.y % 3600) / 60);
            const seconds = context.parsed.y % 60;

            return `${String(hours).padStart(2, "0")}:${String(
              minutes
            ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
          },
        },
      },
    },
  };

  return (
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Top Seven Used Apps</h5>
        <Bar data={appsData} options={options} />
      </div>
    </div>
  );
};

export default AppBarChart;
