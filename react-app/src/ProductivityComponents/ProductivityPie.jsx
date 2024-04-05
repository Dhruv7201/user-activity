import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";

const ProductivityPie = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [productivity, setProductivity] = useState(0);
  const [neutralTime, setNeutralTime] = useState(0);
  const [idleTime, setIdleTime] = useState(0);

  useEffect(() => {
    const getProductivity = async () => {
      const response = await get(
        `/productivitypie?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setProductivity(parseFloat(response.data.productive_time));
      setNeutralTime(parseFloat(response.data.neutral_time));
      setIdleTime(parseFloat(response.data.idle_time));
    };
    getProductivity();
  }, [fromDateYmd, toDateYmd]);

  const formattedProductivity = productivity.toFixed(2);
  const formattedNeutralTime = neutralTime.toFixed(2);
  const formattedIdleTime = idleTime.toFixed(2);

  const data = {
    labels: ["Productive Time", "Neutral Time", "Idle Time"],
    datasets: [
      {
        label: "Productivity",
        data: [productivity, neutralTime, idleTime],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
        ],
      },
    ],
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Productivity Hours</h4>
        </div>
        <div className="card-body">
          <div
            className="card-body"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              height: "300px",
            }}
          >
            <Doughnut data={data} />
          </div>
        </div>
        <div className="card-footer">
          <div className="d-flex justify-content-between">
            <p className="text-muted">
              Productive Time: {formattedProductivity} %
            </p>
            <p className="text-muted">Neutral Time: {formattedNeutralTime} %</p>
            <p className="text-muted">Idle Time: {formattedIdleTime} %</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductivityPie;
