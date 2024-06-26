import React, { useState, useEffect } from "react";
import { Card, ListGroup, Table } from "react-bootstrap";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";
import { Link } from "react-router-dom";

const TopList = ({ order, title }) => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    get(
      `/mostProductiveUsers?fromDate=${fromDateYmd}&toDate=${toDateYmd}&teamname=${localStorage.getItem(
        "teamname"
      )}`
    )
      .then((response) => {
        const userRankings = response.data.user_rankings;

        const usersArray = Object.keys(userRankings).map((username) => ({
          username,
          time: userRankings[username],
        }));

        const sortedUsers =
          order === "1"
            ? usersArray.sort((a, b) => a.time.localeCompare(b.time))
            : usersArray.sort((a, b) => b.time.localeCompare(a.time));

        setUserList(sortedUsers);
      })
      .catch((error) => {});
  }, [fromDateYmd, toDateYmd, order]);

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <div className="productivity">
            <table className="table table-hover">
              <thead className="most-prod-head">
                <tr>
                  <th>Rank</th>
                  <th>User Name</th>
                  <th>User Time</th>
                </tr>
              </thead>
              <tbody className="most-prod-user">
                {userList.map((user, index) => (
                  <tr key={user.username}>
                    <th>{index + 1}</th>
                    <td>
                      <Link
                        to={`/employee/${user.username}`}
                        className="link-style"
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td>{user.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default TopList;
