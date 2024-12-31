// ManageTeamsPage.jsx

import React, { useState, useEffect } from "react";
import { Button, Col, Container, ListGroup, Row } from "react-bootstrap";
import { get, post, del } from "../api/api";
import InputGroupText from "react-bootstrap/esm/InputGroupText";

const ManageTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setTeamName] = useState("");

  const addTeam = async () => {
    if (newTeam === "") {
      return;
    }
    if (teams.includes(newTeam)) {
      return;
    }
    // Update local state first
    setTeams([...teams, newTeam]);
    // Then, make the API call
    await addTeamToApi(newTeam);
    setTeamName("");
  };

  const addTeamToApi = async (teamName) => {
    try {
      if (!teamName) {
        return;
      }

      // Make your API call here, for example:
      await post(`/add_team/${teamName}`);
    } catch (error) {}
  };

  const deleteTeam = async (index) => {
    const deletedTeam = teams[index];
    // Update local state first
    const updatedTeams = teams.filter((_, i) => i !== index);
    setTeams(updatedTeams);
    // Then, make the API call
    await deleteTeamFromApi(deletedTeam);
  };

  const deleteTeamFromApi = async (teamName) => {
    try {
      await del(`/teams/${teamName}`);
    } catch (error) {}
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get("/teams");
        setTeams(response.data.teams);
      } catch (error) {}
    }

    fetchData();
  }, []);

  return (
    <>
      <div class="pagetitle">
        <h1>Manage Teams</h1>
      </div>
      <div className="card">
        <div className="card-body pt-4">
          <Row>
            <Col xs={2}>
              <label className="mt-2">Team name:</label>
            </Col>
            <Col>
              <input
                type="text"
                className="form-control"
                placeholder="Enter team name"
                aria-label="Enter team name"
                aria-describedby="basic-addon2"
                onChange={(e) => setTeamName(e.target.value)}
                value={newTeam}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col xs={2}></Col>
            <Col>
              <Button variant="primary" onClick={addTeam}>
                Add Team
              </Button>
            </Col>
          </Row>

          {teams.length > 0 ? (
            <ListGroup className="mt-3">
              {teams.map((team, index) => (
                <ListGroup.Item
                  key={index}
                  className="d-flex justify-content-between"
                >
                  {team}
                  {team != "admin" && (
                  <Button variant="danger" onClick={() => deleteTeam(index)}>
                    Delete
                  </Button>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <p>No teams available. Add a team using the "Add Team" button.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageTeamsPage;

