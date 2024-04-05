import React, { useState, useEffect } from "react";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";
import { Link } from "react-router-dom";

const MostActiveUser = () => {
  const [users, setUsers] = useState({});
  const { fromDateYmd, toDateYmd } = useDateContext();

  useEffect(() => {
    get(
      `/mostActiveUser?fromDate=${fromDateYmd}&toDate=${toDateYmd}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((res) => {
        setUsers(res.data.user_rankings);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [fromDateYmd, toDateYmd]);

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">Most Active User</h4>
      </div>
      <div className="card-body tableSize">
        <table class="table table-hover">
          <thead className="most-prod-head">
            <tr>
              <th>Rank</th>
              <th>User Name</th>
              <th>User Time</th>
            </tr>
          </thead>
          <tbody className="most-prod-user">
            {Object.entries(users).map(([userName, time], index) => (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>
                  <Link to={`/Employee/${userName}`} className="link-style">
                    {userName}
                  </Link>
                </td>
                <td>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MostActiveUser;
