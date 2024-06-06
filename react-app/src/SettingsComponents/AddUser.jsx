import React, { useState, useEffect } from "react";
import { get, post } from "../api/api";
import { Button, Col, Form, Row } from "react-bootstrap";
import Select from "react-select";

const AddUser = ({ onAddUser, userListKey }) => {
  const [users, setUsers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get("/user_list");
        const modifiedUsers = response.data.map((user) => ({
          value: user,
          label: user,
        }));
        setUsers(modifiedUsers);
      } catch (error) {}
    }

    fetchData();
  }, [userListKey]); // Add userListKey to dependencies

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const handleSubmit = async () => {
    try {
      const response = await post(`users/${selectedOption.value}`);
      onAddUser(selectedOption.value);
      // Assuming the response contains the updated user list data
      const updatedUsers = response.data.map((user) => ({
        value: user,
        label: user,
      }));

      setUsers(updatedUsers);
      // Reset the selected option to null
      setSelectedOption(null);
    } catch (error) {}
  };

  return (
    <>
      <h3 className="mt-4">Add User</h3>
      <Row className="mt-4">
        <Col md={12}>
          <Form.Group>
            <Form.Label>User Name:</Form.Label>
            <Select
              options={users}
              value={selectedOption}
              onChange={handleChange}
              isMulti={false}
              isSearchable={true}
              placeholder="Select User"
            />
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="mt-4"
            onClick={handleSubmit}
          >
            Add User
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default AddUser;
