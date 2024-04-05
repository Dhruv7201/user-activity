import React, { useState, useEffect } from "react";
import { useDateContext } from "../Context/DateContext";
import { get } from "../api/api";

const AttendancePercentage = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [attendancePercentage, setAttendancePercentage] = useState(0);

  useEffect(() => {
    const getAttendancePercentage = async () => {
      const response = await get(
        `/attendancePercentage?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setAttendancePercentage(response.data.present);
    };
    getAttendancePercentage();
  }, [fromDateYmd, toDateYmd]);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Attendance Percentage</h5>
          <p className="card-text">{attendancePercentage}%</p>
        </div>
      </div>
    </>
  );
};

export default AttendancePercentage;
