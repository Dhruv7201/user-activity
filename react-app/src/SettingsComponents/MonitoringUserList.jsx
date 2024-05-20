import React, { useEffect, useState } from "react";
import { get } from "../api/api";
import { del } from "../api/api";
import { Card, ListGroup, Button } from "react-bootstrap";

const MonitoringUserList = () => {
  const [users, setUsers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get("/monitoring-user");
        const usersArray = Object.entries(response.data).map(
          ([username, userData]) => ({ username, ...userData })
        );
        setUsers(usersArray);
      } catch (error) {
        console.error("Error fetching monitoring users:", error);
      }
    };

    fetchData();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleDelete = async (username) => {
    try {
      await del("/monitoring-user/" + username);
      const response = await get(`/monitoring-user`);
      const usersArray = Object.entries(response.data).map(
        ([username, userData]) => ({ username, ...userData })
      );
      setUsers(usersArray);
    } catch (error) {
      console.error("Error deleting monitoring user:", error);
    }
  };

  return (
    <>
      <div className="pagetitle">
        <h1>Existing Users</h1>
      </div>
      {users.map((user, index) => (
        <Card className="existing-users" key={index}>
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            onClick={() => toggleExpand(index)}
            style={{ cursor: "pointer" }}
          >
            {user.username}
          </Card.Header>
          {expandedIndex === index && (
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>Password: {user.password}</ListGroup.Item>
                <ListGroup.Item>Team Name: {user.teamname}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          )}
          {user.username !== "admin" && (
            <Button
              variant="danger"
              onClick={() => handleDelete(user.username)}
            >
              Delete
            </Button>
          )}
        </Card>
      ))}
    </>
  );
};

export default MonitoringUserList;
