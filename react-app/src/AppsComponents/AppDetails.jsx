import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { get } from "../api/api.js";
import { useDateContext } from "../Context/DateContext.jsx";
import DateRange from "../Utils/DateRange";

const AppDetails = () => {
  const { name } = useParams();
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    get(
      `/userList?from_date=${fromDateYmd}&to_date=${toDateYmd}&app_name=${name}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((response) => {
        setUserList(response.data);
      })
      .catch((error) => {});
  }, [fromDateYmd, toDateYmd, name]);

  const handleDropDown = (e) => {
    document.querySelectorAll(".toggle").forEach((item) => {
      if (item !== e.currentTarget) {
        item.classList.remove("open");
      } else {
        item.classList.toggle("open");
      }
    });
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Selected App: {name}</h1>
      </div>
      <Row>
        <Col>
          <DateRange />
        </Col>
      </Row>

      <div className="card">
        <div className="card-body tableSize">
          <h4 className="card-title">User List</h4>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Employee Name</th>
                <th>Start Time Of App</th>
                <th>Total Used Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(userList).map((userId, index) => (
                <tr key={index}>
                  <td>
                    <b>{index + 1}</b>
                  </td>
                  <td>
                    <Link to={`/employee/${userId}`} className="link-style">
                      {userId}
                    </Link>
                  </td>
                  <td>
                    <ul className="toggle" onClick={handleDropDown}>
                      {userList[userId].start_time.map((startTime, i) => (
                        <li key={i}>{startTime}</li>
                      ))}
                    </ul>
                  </td>
                  <td>
                    <ul className="toggle" onClick={handleDropDown}>
                      {userList[userId].used_time.map((usedTime, i) => (
                        <li key={i}>{usedTime}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AppDetails;
