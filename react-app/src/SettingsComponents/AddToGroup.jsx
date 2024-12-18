import React, { useState, useEffect, useCallback } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import { get, post } from "../api/api.js";
import { useDateContext } from "../Context/DateContext";

function AddToGroup({ onAddToGroup }) {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectSuggestions, setSelectSuggestions] = useState();
  const [options, setOptions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [nameGroup, setNameGroup] = useState("");

  useEffect(() => {
    fetchApplications();
  }, [fromDateYmd, toDateYmd]);

  useEffect(() => {
    updateSuggestions();
  }, [selectedOption]);

  const fetchApplications = async () => {
    try {
      const response = await get(
        `/userDataTable?from_date=${fromDateYmd}&to_date=${toDateYmd}`
      );
      const applications = response.data;
      const valuesLabels = mapValuesLabels(applications);
      setOptions(valuesLabels);
    } catch (error) {}
  };

  const mapValuesLabels = (applications) => {
    return applications.map((application) => ({
      value: application.window_title,
      label: application.window_title,
    }));
  };

  const updateSuggestions = () => {
    if (selectedOption) {
      const selectedValue = selectedOption.value;
      const words = selectedValue.split(/[-?/.,!@#$%^&*()_+=~<>{}\[\]:;"'\\|]/);
      setSuggestions(words.map((word) => word.trim()));
    } else {
      setSuggestions([]);
    }
  };

  const AddToGroup = async () => {
    try {
      const response = await post("/addGroup", {
        application: selectSuggestions.value,
        nameGroup,
      });

      // Call the parent component's callback to refresh the group list
      onAddToGroup();
    } catch (error) {}
  };

  const handleSuggestionsChange = (selectedOption) => {
    setSelectSuggestions(selectedOption);
    setNameGroup(selectedOption.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    AddToGroup();
    setSelectedOption(null);
    setSelectSuggestions(null);
    setNameGroup("");
  };

  return (
    <>
      <h3 className="mt-4">Group Application</h3>

      <div className="card">
        <div className="card-body pt-4">
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Application Name:</Form.Label>
                <Select
                  value={selectedOption}
                  onChange={setSelectedOption}
                  options={options}
                  isClearable={true}
                  isSearchable={true}
                  placeholder="Select or type..."
                />
              </Form.Group>
            </Col>
          </Row>
          {suggestions.length > 0 && (
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Key Word:</Form.Label>
                  <Select
                    value={selectSuggestions}
                    onChange={handleSuggestionsChange}
                    options={suggestions.map((suggestion, index) => ({
                      value: suggestion,
                      label: suggestion,
                    }))}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Select or type..."
                  />
                </Form.Group>
              </Col>
              {selectSuggestions && (
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Name Group:</Form.Label>
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Name Group"
                        value={nameGroup}
                        onChange={(event) => setNameGroup(event.target.value)}
                      />
                      {nameGroup && (
                        <div className="input-group-append">
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => setNameGroup("")}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </Form.Group>
                </Col>
              )}
            </Row>
          )}
          <Row className="mt-4">
            <Col>
              <Button
                variant="primary"
                type="submit"
                className="mr-3"
                onClick={handleSubmit}
                disabled={!selectSuggestions}
              >
                Submit
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

export default AddToGroup;
