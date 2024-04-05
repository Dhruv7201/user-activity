import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { useDateContext } from "../Context/DateContext.jsx";
import { get } from "../api/api.js";

const UserPie = ({ name }) => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [chartData, setChartData] = useState({ present: 0, absent: 0 });

  const fetchData = async () => {
    try {
      const response = await get(
        `/userAttendance?name=${name}&from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      const attendanceData = response.data;
      const presentCount = Object.values(attendanceData).filter(
        (status) => status === "Present"
      ).length;
      const absentCount = Object.values(attendanceData).filter(
        (status) => status === "Absent"
      ).length;

      setChartData({ present: presentCount, absent: absentCount });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fromDateYmd, toDateYmd, name]);

  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        label: "Count",
        data: [chartData.present, chartData.absent],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderWidth: 4,
      },
    ],
  };

  const options = {
    title: {
      display: true,
      text: "Attendance",
      fontSize: 25,
    },
    legend: {
      display: true,
      position: "right",
    },
  };

  return (
    <div className="card">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default UserPie;
