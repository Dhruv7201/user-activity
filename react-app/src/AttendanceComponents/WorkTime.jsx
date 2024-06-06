import React, { useState, useEffect } from "react";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const WorkTime = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [workTime, setWorkTime] = useState(0);

  const fetchWorkTime = async () => {
    try {
      const response = await get(
        `/workTime?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setWorkTime(response.data.work_time);
    } catch (error) {}
  };

  useEffect(() => {
    // Fetch initial work time
    fetchWorkTime();

    // Periodically fetch work time every second
    const intervalId = setInterval(fetchWorkTime, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fromDateYmd, toDateYmd]);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Work Time</h5>
          <p className="card-text">{workTime} hours</p>
        </div>
      </div>
    </>
  );
};

export default WorkTime;
