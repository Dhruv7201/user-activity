import React, { useEffect, useState } from "react";

const LateArrivalsList = () => {
  const [users, setUsers] = useState({});
  useEffect(() => {
    const user_date = {
      Rahul: "00:00:00",
      Raj: "00:00:00",
      Rohan: "00:00:00",
    };

    setUsers(user_date);
  }, []);
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h4 className="card-title">Late Arrivals List</h4>
        </div>
        <div className="card-body tableSize">
          <table className="table table-hover">
            <thead className="most-prod-head">
              <tr>
                <th>Rank</th>
                <th>User Name</th>
                <th>Arrived At</th>
              </tr>
            </thead>
            <tbody className="most-prod-user">
              {Object.entries(users).map(([userName, time], index) => (
                <tr key={userName}>
                  <th>{index + 1}</th>
                  <td>{userName}</td>
                  <td>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default LateArrivalsList;
