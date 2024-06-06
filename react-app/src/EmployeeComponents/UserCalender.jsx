import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./UserCalender.css";
import { useDateContext } from "../Context/DateContext.jsx";
import { get } from "../api/api.js";

const UserCalendar = ({ name }) => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [attendanceData, setAttendanceData] = useState({});

  const fetchData = async () => {
    try {
      const response = await get(
        `/userAttendance?name=${name}&from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setAttendanceData(response.data);
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, [fromDateYmd, toDateYmd, name]);

  // Create an initial state for the selected date
  const [selectedDate, setSelectedDate] = useState(null);

  // Function to format the date in 'YYYY-MM-DD' format
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // Function to determine the class for the date cell based on attendance data
  const getClassForDate = (date) => {
    const formattedDate = formatDate(date);
    const attendanceStatus = attendanceData[formattedDate];

    if (attendanceStatus === "Present") {
      return "present-date";
    } else if (attendanceStatus === "Absent") {
      return "absent-date";
    }

    return "";
  };

  // Event handler for date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="card">
      <Calendar
        className="calendar"
        value={selectedDate}
        // onChange={handleDateChange}
        tileClassName={({ date, view }) => {
          if (view === "month") {
            return getClassForDate(date);
          }
        }}
      />
    </div>
  );
};

export default UserCalendar;
