import React, { useEffect, useState } from "react";
import { useDateContext } from "../Context/DateContext.jsx";
import { Link } from "react-router-dom";
import { get } from "../api/api.js";
import DataTable from "react-data-table-component";

function EmployeeList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { dateYmd } = useDateContext();
  const api =
    "/employeelist?date=" +
    dateYmd +
    "&teamname=" +
    localStorage.getItem("teamname");
  const [employeeData, setEmployeeData] = useState([]);

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

      setEmployeeData(userArray);
    } catch (error) {}
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      name: "S.No",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: "50px",
      maxWidth: "100px",
    },
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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filterBySearchTerm = (row) => {
    return new RegExp(escapeRegExp(searchTerm), "i").test(row.name);
  };

  const filteredEmployeeData = employeeData.filter(filterBySearchTerm);

  return (
    <>
      <div className="card dataTable">
        <div className="card-header">
          <div className="flex-container">
            <div className="row">
              <div className="col-md-3">
                <input
                  type="text"
                  placeholder="Search Application Name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="form-control"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="text-right flex align-items-center justify-content-end mb-1 col-sm-9">
                <button
                  className="btn btn-primary"
                  onClick={handleClearSearch}
                  disabled={!searchTerm}
                >
                  Clear Search
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredEmployeeData}
            pagination={true}
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 40, 50]}
            highlightOnHover={true}
            dense={true}
          />
        </div>
      </div>
    </>
  );
}

export default EmployeeList;
