import React, { useState, useEffect } from "react";
import { get, del, put } from "../api/api";
import DataTable from "react-data-table-component";
import { Button, Form, Row, Col } from "react-bootstrap";

const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get("/users");
        setUserList(Object.entries(response.data.user_list));
        setTeams(response.data.teams);
      } catch (error) {}
    }

    fetchData();
  }, []);

  const handleDeleteUser = async (usernameToDelete) => {
    try {
      await del(`/users/${usernameToDelete}`);

      const response = await get("/users");
      setUserList(Object.entries(response.data.user_list));
    } catch (error) {}
  };

  const handleAssignTeam = async (username, team) => {
    try {
      await updateTeamForUser(username, team);
      setUserList((prevUserList) =>
        prevUserList.map(([user, userTeam]) =>
          user === username ? [user, team] : [user, userTeam]
        )
      );
    } catch (error) {}
  };

  const updateTeamForUser = async (username, newTeam) => {
    try {
      // Make your API call here, for example:
      await put(`/users/${username}?teamname=${newTeam}`);
    } catch (error) {
      throw new Error(`Error updating team for ${username}: ${error.message}`);
    }
  };

  const filteredUserList = userList.filter(([username]) =>
    username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "User",
      selector: (row) => row[0],
      sortable: true,
      grow: 2,
    },
    {
      name: "Assigned To",
      cell: (row) => (
        <Form.Control
          as="select"
          value={row[1]}
          onChange={(e) => handleAssignTeam(row[0], e.target.value)}
        >
          {teams.map((teamName) => (
            <option key={teamName} value={teamName}>
              {teamName}
            </option>
          ))}
        </Form.Control>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <Button variant="danger" onClick={() => handleDeleteUser(row[0])}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="mb-5">
      <div className="card mb-4">
        <div className="card-body pt-4">
          <div className="search-bar">
            <div className="row mb-2">
              <div className="col">
                <Form.Control
                  type="text"
                  placeholder="Search by User"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col">
                <Button
                  variant="primary"
                  onClick={() => setSearchTerm("")}
                  disabled={!searchTerm}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DataTable
        title="User List"
        columns={columns}
        data={filteredUserList}
        pagination
        paginationPerPageOptions={[10, 25, 50]}
        highlightOnHover
        striped
        paginationServer
      />
    </div>
  );
};

export default UserList;
