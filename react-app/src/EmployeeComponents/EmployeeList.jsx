import React, { useEffect, useState } from "react";
import { useDateContext } from "../Context/DateContext.jsx";
import { Link } from "react-router-dom";
import { get } from "../api/api.js";

function EmployeeList() {
  const { dateYmd } = useDateContext();
  const api =
    "/employeelist?date=" +
    dateYmd +
    "&teamname=" +
    localStorage.getItem("teamname");
  const [appData, setAppData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await get(api);
      const data = response.data;

      // Transform the response object into an array of objects
      const userArray = Object.entries(data).map(([name, userData]) => ({
        name,
        used_time: userData.used_time,
        total_idle_time: userData.total_idle_time,
        total_time: userData.total_time,
      }));

      setAppData(userArray);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [dateYmd]);

  const columns = [
    {
      name: "User Name",
      selector: "name",
      sortable: true,
      cell: (row) => {
        return (
          <Link to={`/employee/${row.name}`} className="link-style">
            {row.name}
          </Link>
        );
      },
      minWidth: "200px",
      maxWidth: "250px",
    },
    {
      name: "Total Work Time",
      selector: "used_time",
      sortable: true,
      style: {
        color: "green",
      },
    },
    {
      name: "Total Idle Time",
      selector: "total_idle_time",
      sortable: true,
      style: {
        color: "red",
      },
    },
    {
      name: "Total Time",
      selector: "total_time",
      sortable: true,
    },
  ];

  return (
    <>
      <div className="card">
        <div className="card-body">
          <table id="myTable" className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.name}>{column.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appData.map((row) => (
                <tr key={row.name}>
                  {columns.map((column) => (
                    <td key={column.name}>
                      {column.cell ? column.cell(row) : row[column.selector]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default EmployeeList;
