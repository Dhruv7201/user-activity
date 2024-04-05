import React from "react";
import { useState, useCallback } from "react";
import { Col, Container, Row, Collapse, Button } from "react-bootstrap";
import AddToGroup from "../SettingsComponents/AddToGroup";
import GroupList from "../SettingsComponents/GroupList";
import DateRange from "../Utils/DateRange";

const AddToGroupPage = () => {
  const [groupListKey, setGroupListKey] = useState(0);
  const [addToGroupOpen, setAddToGroupOpen] = useState(true);

  const refreshGroupList = useCallback(() => {
    setGroupListKey((prevKey) => prevKey + 1);
  }, []);
  return (
    <>
      <div class="pagetitle">
        <h1>Add To Group</h1>
      </div>
      <Row>
        <DateRange />
      </Row>
      <Row>
        <Col>
          <Collapse in={addToGroupOpen}>
            <div id="add-to-group-collapse">
              <AddToGroup onAddToGroup={refreshGroupList} />
            </div>
          </Collapse>
        </Col>
      </Row>
      <Row>
        <Col>
          <GroupList key={groupListKey} />
        </Col>
      </Row>
    </>
  );
};

export default AddToGroupPage;
