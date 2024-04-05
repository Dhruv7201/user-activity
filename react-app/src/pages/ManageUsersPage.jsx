import React from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import UserList from "../SettingsComponents/UserList";
import MonitoringUserList from "../SettingsComponents/MonitoringUserList";

const ManageUsersPage = () => {
  return (
    <>
      <div class="pagetitle">
        <h1>Manage Users</h1>
      </div>
      <Row>
        <Col>
          <UserList />
        </Col>
      </Row>
      <Row>
        <Col>
          <MonitoringUserList />
        </Col>
      </Row>
    </>
  );
};

export default ManageUsersPage;
