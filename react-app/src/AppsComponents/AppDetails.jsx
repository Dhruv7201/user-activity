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
      .catch((error) => {
        console.log(error);
      });
  }, [fromDateYmd, toDateYmd, name]);

  return (
    <>
      <div class="pagetitle">
        <h1>Selected App: {name}</h1>
      </div>
      <Row>
        <Col>
          <DateRange />
        </Col>
      </Row>

      <div className="card">
        <div className="card-header">
          <h4 className="card-title">User List</h4>
        </div>
        <div className="card-body tableSize">
          <table class="table table-hover">
            <thead className="most-prod-head">
              <tr>
                <th>#</th>
                <th>Employee Name</th>
                <th>Start Time Of App</th>
                <th>Total Used Time</th>
              </tr>
            </thead>
            <tbody className="most-prod-user">
              {Object.keys(userList).map((userId, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <Link to={`/employee/${userId}`} className="link-style">
                    <td>{userId}</td>
                  </Link>
                  <td>
                    <div>
                      {userList[userId].start_time.map((startTime, i) => (
                        <div key={i}>{startTime}</div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div>
                      {userList[userId].used_time.map((used_time, i) => (
                        <div key={i}>{used_time}</div>
                      ))}
                    </div>
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
