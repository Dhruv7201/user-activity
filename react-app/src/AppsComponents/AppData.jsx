import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { useDateContext } from "../Context/DateContext.jsx";
import { Button, Col, Row } from "react-bootstrap";
import { get } from "../api/api.js";

function AppData() {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const api = `/userDataTable?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
    "teamname"
  )}`;
  const [appData, setAppData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAppData = async () => {
    try {
      const response = await get(api);
      const data = response.data;

      // Add index to the data
      const formattedData = data.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setAppData(formattedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAppData();
  }, [api]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const columns = [
    {
      name: "Index",
      selector: "index",
      sortable: true,
      minWidth: "100px",
      maxWidth: "150px",
    },
    {
      name: "Application Name",
      selector: (row) => (
        <Link to={`/apps/${row.window_title}`} className="link-style">
          {row.window_title}
        </Link>
      ),
      sortable: true,
      minWidth: "700px",
      maxWidth: "750px",
    },
    {
      name: "Count",
      selector: (row) => row.count_of_all_apps,
      sortable: true,
    },
    {
      name: "Unproductive",
      selector: (row) => (row.unproductive ? "Yes" : "No"),
      sortable: true,
    },
  ];

  const filteredAppData = appData.filter((row) =>
    new RegExp(searchTerm, "i").test(row.window_title)
  );

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex-container">
            <Row>
              <Col sm={5}>
                <input
                  type="text"
                  placeholder="Search Application Name"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="form-control"
                  style={{ outline: "none" }}
                />
              </Col>
              <Col
                sm={6}
                className="text-right flex align-items-center justify-content-end mt-1 mb-1"
              >
                <Button
                  variant="btn btn-primary"
                  onClick={handleClearSearch}
                  disabled={!searchTerm}
                >
                  Clear Search
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={filteredAppData}
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

export default AppData;
