import React, { useState, useEffect } from "react";
import { get, del, put } from "../api/api";
import DataTable from "react-data-table-component";
import { Button, Form } from "react-bootstrap";
import "./UserList.css";

const UserList = () => {
  const [userList, setUserList] = useState([]);
  const [originalUserNames, setOriginalUserNames] = useState({});
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get("/users");
        const formattedUserList = Object.entries(response.data.user_list).map(
          ([username, details]) => ({
            username,
            ...details,
          })
        );
        setUserList(formattedUserList);

        // Track the original user_name values
        const originalNames = {};
        formattedUserList.forEach((user) => {
          originalNames[user.username] = user.user_name;
        });
        setOriginalUserNames(originalNames);

        setTeams(response.data.teams);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchData();
  }, []);

  const handleDeleteUser = async (usernameToDelete) => {
    try {
      await del(`/users/${usernameToDelete}`);

      const response = await get("/users");
      const formattedUserList = Object.entries(response.data.user_list).map(
        ([username, details]) => ({
          username,
          ...details,
        })
      );
      setUserList(formattedUserList);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAssignTeam = async (username, team) => {
    try {
      await put(`/users/${username}?teamname=${team}&user_name=${null}`);
      setUserList((prevUserList) =>
        prevUserList.map((user) =>
          user.username === username ? { ...user, teamname: team } : user
        )
      );
    } catch (error) {
      console.error(`Error assigning team for ${username}:`, error);
    }
  };

  const handleSaveUserName = async (username, updatedUserName) => {
    try {
      // Make an API call to update the user_name
      await put(
        `/users/${username}?user_name=${updatedUserName}&teamname=${null}`
      );

      setUserList((prevUserList) =>
        prevUserList.map((user) =>
          user.username === username
            ? { ...user, user_name: updatedUserName }
            : user
        )
      );

      setOriginalUserNames((prev) => ({
        ...prev,
        [username]: updatedUserName,
      }));
    } catch (error) {
      console.error(`Error saving new username for ${username}:`, error);
    }
  };

  const handleUserNameChange = (username, newUserName) => {
    setUserList((prevUserList) =>
      prevUserList.map((user) =>
        user.username === username ? { ...user, user_name: newUserName } : user
      )
    );
  };

  const filteredUserList = userList.filter(
    (user) =>
      // search in username hostname or user
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.host_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: "User",
      selector: (row) => row.username,
      sortable: true,
    },
    {
      name: "Host Name",
      selector: (row) => row.host_name,
      sortable: true,
    },
    {
      name: "User Name",
      cell: (row) => (
        <div className="d-flex align-items-center">
          <Form.Control
            type="text"
            value={row.user_name}
            onChange={(e) => handleUserNameChange(row.username, e.target.value)}
          />
          {row.user_name !== originalUserNames[row.username] && (
            <Button
              className="ml-2 border rounded p-1 bg-primary text-white cursor-pointer"
              onClick={() => handleSaveUserName(row.username, row.user_name)}
            >
              <i className="bi bi-check-lg"></i>
            </Button>
          )}
        </div>
      ),
    },
    {
      name: "Assigned To",
      cell: (row) => (
        <Form.Control
          as="select"
          value={row.teamname}
          onChange={(e) => handleAssignTeam(row.username, e.target.value)}
          className="custom-dropdown"
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
        <Button variant="danger" onClick={() => handleDeleteUser(row.username)}>
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
      />
    </div>
  );
};

export default UserList;

