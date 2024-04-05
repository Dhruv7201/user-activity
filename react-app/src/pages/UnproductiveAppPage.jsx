import React from "react";
import { useState, useCallback } from "react";
import { Col, Container, Row, Collapse, Button } from "react-bootstrap";
import DateRange from "../Utils/DateRange";
import AppList from "../SettingsComponents/AppList";
import SetUnproductive from "../SettingsComponents/SetUnproductive";

const UnproductiveAppPage = () => {
  const [appListKey, setAppListKey] = useState(0);
  const [setUnproductiveOpen, setSetUnproductiveOpen] = useState(true);

  const refreshAppList = useCallback(() => {
    setAppListKey((prevKey) => prevKey + 1);
  }, []);
  return (
    <>
      <div class="pagetitle">
        <h1>Unproductive Apps</h1>
      </div>
      <Row>
        <Col>
          <Collapse in={setUnproductiveOpen}>
            <div id="set-unproductive-collapse">
              <SetUnproductive onAppAdd={refreshAppList} />
            </div>
          </Collapse>
        </Col>
      </Row>
      <Row>
        <Col>
          <AppList key={appListKey} />
        </Col>
      </Row>
    </>
  );
};

export default UnproductiveAppPage;
