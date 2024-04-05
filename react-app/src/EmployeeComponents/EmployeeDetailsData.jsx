import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, ListGroup, Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useDateContext } from "../Context/DateContext.jsx";
import { get } from "../api/api.js";
import UserPie from "./UserPie.jsx";
import DateRange from "../Utils/DateRange";
import UserCalendar from "./UserCalender.jsx";

const EmployeeDetailsData = () => {
  const { name } = useParams();
  const [groups, setGroups] = useState({});
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { fromDateYmd, toDateYmd } = useDateContext();

  const handleGroupClick = (group) => {
    if (selectedGroups.includes(group)) {
      setSelectedGroups(
        selectedGroups.filter((selectedGroup) => selectedGroup !== group)
      );
    } else {
      setSelectedGroups([...selectedGroups, group]);
    }
  };

  const calculateTotalTime = (group) => {
    // Sort the apps by time from greater to smaller
    group.sort((a, b) => {
      const [hoursA, minutesA, secondsA] = a.app_time.split(":").map(Number);
      const [hoursB, minutesB, secondsB] = b.app_time.split(":").map(Number);
      const timeInSecondsA = hoursA * 3600 + minutesA * 60 + secondsA;
      const timeInSecondsB = hoursB * 3600 + minutesB * 60 + secondsB;
      return timeInSecondsB - timeInSecondsA;
    });

    const totalSeconds = group.reduce((total, app) => {
      const [hours, minutes, seconds] = app.app_time.split(":").map(Number);
      return total + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(
          `/applistofemployee?name=${name}&from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
            "teamname"
          )}`
        );

        const groupedData = {};
        response.data.forEach((item) => {
          const groupName = item.group_name;
          if (!groupedData[groupName]) {
            groupedData[groupName] = [];
          }
          // Include app_time in the data
          groupedData[groupName].push({
            window_title: item.window_title,
            app_time: item.app_time,
          });
        });

        setGroups(groupedData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [name, fromDateYmd, toDateYmd]);

  const sortedGroupNames = Object.keys(groups).sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return (
    <>
      <style>
        {`
          .list-item-with-app-time {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .total-time {
            font-weight: bold;
          }

          .group-container {
            max-height: 300px; /* Set the maximum height as needed */
            overflow-y: auto; /* Enable vertical scrolling */
          }
          .clickable-group-name {
            cursor: pointer;
          }
        `}
      </style>

      <Row className="mt-4">
        <Col md={5} className="text-right">
          <h3 className="mb-4">Selected User : {name}</h3>
        </Col>
      </Row>
      <Row className="mt-4 mb-4">
        <Col>
          <DateRange />
        </Col>
      </Row>
      <Row>
        <Col md={4}>
          <UserPie name={name} />
        </Col>
        <Col md={8}>
          <UserCalendar name={name} />
        </Col>
      </Row>
      {sortedGroupNames.map((groupName) => (
        <Card key={groupName} className="mb-3">
          <Card.Header>
            <div
              className="d-flex justify-content-between align-items-center clickable-group-name"
              onClick={() => handleGroupClick(groupName)}
            >
              <div>
                <Button
                  variant="link"
                  aria-controls={`collapse-${groupName}`}
                  aria-expanded={selectedGroups.includes(groupName)}
                >
                  {groupName}
                </Button>
              </div>
              <span className="total-time">
                {calculateTotalTime(groups[groupName])}
              </span>
            </div>
          </Card.Header>
          <div
            id={`collapse-${groupName}`}
            className={`collapse ${
              selectedGroups.includes(groupName) ? "show" : ""
            }`}
          >
            <Card.Body>
              <div className="group-container">
                <ListGroup variant="flush">
                  {groups[groupName].map((app, index) => (
                    <ListGroup.Item
                      key={index}
                      className="list-item-with-app-time"
                    >
                      {app.window_title}
                      <span className="app-time">{app.app_time}</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </div>
        </Card>
      ))}
    </>
  );
};

export default EmployeeDetailsData;
