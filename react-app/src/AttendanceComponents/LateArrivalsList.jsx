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
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Most Active User</h5>

          <table class="table table-hover">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User Name</th>
                <th>Arrived At</th>
              </tr>
            </thead>
            <tbody>
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
