import React, { useState, useEffect } from "react";
import { Button, Container, Form, Row, Col, Alert } from "react-bootstrap";
import { get, post } from "../api/api";
import { useNavigate } from "react-router-dom";

const AddUserPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Passwords do not match");
  const [alertType, setAlertType] = useState("danger");
  const [passwordType, setPasswordType] = useState("password");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [showPassword, setShowPassword] = useState("Show");
  const [showConfirmPassword, setShowConfirmPassword] = useState("Show");
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  const addUser = async () => {
    if (password !== confirmPassword) {
      setAlertType("danger");
      setErrorMessage("Passwords do not match");
      setShowErrorAlert(true);
      return;
    }

    if (
      username === "" ||
      username === null ||
      password === "" ||
      password === null ||
      selectedTeams.length === 0
    ) {
      setAlertType("danger");
      setErrorMessage(
        "Username, Password, and at least one Team must be selected"
      );
      setShowErrorAlert(true);
      return;
    }

    try {
      const response = await post("/monitoring-user", {
        username,
        password,
        selectedTeams,
      });

      setAlertType("success");
      setErrorMessage("User Added Successfully");
      navigate(window.history.back());
    } catch (error) {
      setAlertType("danger");
      setErrorMessage(`Error adding user: ${error.message}`);
      setShowErrorAlert(true);
    }
  };

  useEffect(() => {
    const getTeams = async () => {
      try {
        const response = await get("/teams");
        setTeams(response.data.teams);
      } catch (error) {}
    };
    getTeams();
  }, []);

  return (
    <>
      <div class="pagetitle">
        <h1>Add User</h1>
      </div>
      <div className="card">
        <div className="card-body pt-4">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <Form.Label>User Name</Form.Label>
                <Form.Control
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  id="username"
                  type="text"
                  placeholder="Enter User Name"
                />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>User Password</Form.Label>
                <div className="input-group display-flex justify-content-between">
                  <Form.Control
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    id="password"
                    type={passwordType}
                    placeholder="Enter User Password"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      setPasswordType((prev) =>
                        prev === "password" ? "text" : "password"
                      );
                      setShowPassword((prev) =>
                        prev === "Show" ? "Hide" : "Show"
                      );
                    }}
                  >
                    {showPassword}
                  </Button>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <div className="input-group display-flex justify-content-between">
                  <Form.Control
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    id="confirmPassword"
                    type={confirmPasswordType}
                    placeholder="Confirm Password"
                  />
                  <Button
                    variant="outline-secondary max-width-10"
                    onClick={() => {
                      setConfirmPasswordType((prev) =>
                        prev === "password" ? "text" : "password"
                      );
                      setShowConfirmPassword((prev) =>
                        prev === "Show" ? "Hide" : "Show"
                      );
                    }}
                  >
                    {showConfirmPassword}
                  </Button>
                </div>
              </div>
            </div>
            <div className="row mb-3">
              <div className="mb-3">
                <Form.Label>Select Teams</Form.Label>
                <div className="select-options">
                  {teams.map((team) => (
                    <Form.Check
                      key={team}
                      type="checkbox"
                      id={`team-${team}`}
                      label={team}
                      checked={selectedTeams.includes(team)}
                      onChange={() => {
                        setSelectedTeams((prevTeams) => {
                          if (prevTeams.includes(team)) {
                            // Team is already selected, remove it
                            return prevTeams.filter(
                              (selectedTeam) => selectedTeam !== team
                            );
                          } else {
                            // Team is not selected, add it
                            return [...prevTeams, team];
                          }
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {showErrorAlert && (
              <Alert variant={alertType}>{errorMessage}</Alert>
            )}
            <div className="mb-3">
              <Button
                variant="primary"
                type="submit"
                onClick={() => {
                  addUser();
                }}
              >
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default AddUserPage;
