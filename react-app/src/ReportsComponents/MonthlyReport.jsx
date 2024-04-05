import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Row, Table } from "react-bootstrap";
import MonthSelector from "../Utils/MonthSelector";
import { get } from "../api/api";
import { formatNumericDate, isCurrentMonth } from "../Utils/DateUtils";

const MonthlyReport = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyReportData, setMonthlyReportData] = useState({});

  const handleDateChange = (date) => {
    if (!date || isNaN(date.getTime())) return;
    setSelectedDate(date);
  };

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  // Ensure that the date format matches the format used in the API response
  const formatApiDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!selectedDate) {
      return; // Do nothing if selectedDate is null
    }
    const fetchMonthlyReport = async () => {
      const response = await get(
        `/monthlyreport?month=${formatNumericDate(
          selectedDate
        )}&teamname=${localStorage.getItem("teamname")}`
      );
      setMonthlyReportData(response.data.data);
    };
    fetchMonthlyReport();
  }, [selectedDate]);

  return (
    <>
      <MonthSelector
        selectedDate={selectedDate}
        handleDateChange={handleDateChange}
        clearSelectedDate={() => setSelectedDate(new Date())}
        isCurrentMonth={isCurrentMonth(selectedDate)}
      />
      <div className="card">
        <div
          className="scrollable-table-container"
          style={{ overflowY: "auto" }}
        >
          <Table className="card-body tableSize">
            <thead>
              <tr>
                <th
                  style={{
                    position: "sticky",
                    left: 0,
                    background: "white",
                    zIndex: 1,
                  }}
                >
                  Employee Name
                </th>
                {[...Array(daysInMonth)].map((_, index) => (
                  <th key={index + 1}>{index + 1}</th>
                ))}
                <th>Total Present</th>
                <th>Total Absent</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(monthlyReportData).map((employeeId) => {
                const employeeData = monthlyReportData[employeeId];

                // Variables to keep track of total present and total absent
                let totalPresent = 0;
                let totalAbsent = 0;

                return (
                  <tr key={employeeId}>
                    <td
                      style={{
                        position: "sticky",
                        left: 0,
                        background: "white",
                        zIndex: 1,
                      }}
                    >
                      <Link
                        to={`/employee/${employeeData.user_id}`}
                        className="link-style"
                      >
                        {employeeData.user_id}
                      </Link>
                    </td>
                    {[...Array(daysInMonth)].map((_, index) => {
                      const currentDate = new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth(),
                        index + 1
                      );
                      const dayKey = formatApiDate(currentDate);
                      const attendanceStatus = employeeData[dayKey];

                      // Count total present and total absent
                      if (attendanceStatus === "P") {
                        totalPresent += 1;
                      } else if (attendanceStatus === "A") {
                        totalAbsent += 1;
                      }

                      // Set background color based on attendance status
                      const cellStyle = {
                        backgroundColor:
                          attendanceStatus === "P"
                            ? "#d4edda"
                            : attendanceStatus === "A"
                            ? "#f8d7da"
                            : "white",
                      };

                      return (
                        <td key={index + 1} style={cellStyle}>
                          {attendanceStatus || "-"}
                        </td>
                      );
                    })}
                    <td>{totalPresent}</td>
                    <td>{totalAbsent}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default MonthlyReport;
