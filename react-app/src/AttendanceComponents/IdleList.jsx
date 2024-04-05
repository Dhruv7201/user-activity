import React, { useEffect, useState } from "react";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";
import { Link } from "react-router-dom";

const IdleList = () => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    get(
      "idleList/?from_date=" +
        fromDateYmd +
        "&to_date=" +
        toDateYmd +
        "&teamname=" +
        localStorage.getItem("teamname")
    )
      .then((response) => {
        const idleList = response.data.idle_list;
        // Convert the object into an array of objects
        const userList = Object.entries(idleList).map(
          ([user_name, user_time]) => ({
            user_name,
            user_time,
          })
        );
        setUsers(userList);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [fromDateYmd, toDateYmd]);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Idle List</h4>
        </div>
        <div className="card-body tableSize">
          <table className="table table-hover">
            <thead className="most-prod-head">
              <tr>
                <th>Rank</th>
                <th>User Name</th>
                <th>User Time</th>
              </tr>
            </thead>
            <tbody className="most-prod-user">
              {users.map((user, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>
                    <Link
                      to={`/employee/${user.user_name}`}
                      className="link-style"
                    >
                      {user.user_name}
                    </Link>
                  </td>
                  <td>{user.user_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default IdleList;
