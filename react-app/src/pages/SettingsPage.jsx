import React, { useState, useCallback } from "react";
import { Col, Container, Row, Button, Card } from "react-bootstrap";
import UserList from "../SettingsComponents/UserList";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenValid = isTokenValid();

    if (!tokenValid) {
      console.log("Token is not valid. Redirect to login.");
      removeToken();
      navigate("/", {
        state: { error: "Session expired. Please log in again." },
      });
    }
  }, [navigate]);

  const handleManageTeams = () => {
    navigate("/settings/manage-teams");
  };

  const handleAddToGroup = () => {
    navigate("/settings/add-to-group");
  };

  const handleAddUnproductive = () => {
    navigate("/settings/unproductive-apps");
  };

  const handleAddUser = () => {
    navigate("/settings/add-user");
  };

  const handleManageUsers = () => {
    navigate("/settings/manage-users");
  };

  return (
    <>
      <div class="pagetitle">
        <h1>Settings</h1>
      </div>
      <Row className="mt-4 mb-4">
        <Col>
          <Card className="mr-4">
            <Card.Body>
              <Card.Title>Add Applications to Group</Card.Title>
              <Button onClick={handleAddToGroup}>Add</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mr-4">
            <Card.Body>
              <Card.Title>Set Unproductive Applications</Card.Title>
              <Button onClick={handleAddUnproductive}>Set</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mr-4">
            <Card.Body>
              <Card.Title>Add User (Monitoring) </Card.Title>
              <Button onClick={handleAddUser}>Add</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4 mb-4">
        <Col>
          <Card className="mr-4">
            <Card.Body>
              <Card.Title>Manage teams</Card.Title>
              <Button onClick={handleManageTeams}>Manage</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="mr-4">
            <Card.Body>
              <Card.Title>Manage Users</Card.Title>
              <Button onClick={handleManageUsers}>Manage</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SettingsPage;
