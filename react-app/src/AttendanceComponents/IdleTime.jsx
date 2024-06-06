import React, { useState, useEffect } from "react";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const IdleTime = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [idleTime, setIdleTime] = useState(0);

  const fetchIdleTime = async () => {
    try {
      const response = await get(
        `/idleTime?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setIdleTime(response.data.idle_time);
    } catch (error) {}
  };

  useEffect(() => {
    // Fetch initial idle time
    fetchIdleTime();

    // Periodically fetch idle time every second
    const intervalId = setInterval(fetchIdleTime, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fromDateYmd, toDateYmd]);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Idle Time</h5>
          <p className="card-text">{idleTime} hours</p>
        </div>
      </div>
    </>
  );
};

export default IdleTime;
