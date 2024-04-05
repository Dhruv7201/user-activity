import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";

const Productivity = ({ url, title }) => {
  const { fromDateYmd, toDateYmd } = useDateContext();
  const [productivity, setProductivity] = useState(0);

  useEffect(() => {
    const getProductivity = async () => {
      const response = await get(
        `${url}?from_date=${fromDateYmd}&to_date=${toDateYmd}&teamname=${localStorage.getItem(
          "teamname"
        )}`
      );
      setProductivity(response.data.productivity);
    };
    getProductivity();
  }, [fromDateYmd, toDateYmd]);

  return (
    <>
      <Card>
        <Card.Body>
          <Card.Title>{title}</Card.Title>
          <div className="card-productivity">
            <Card.Text>
              {title === "Productivity" ? `${productivity}%` : productivity}
            </Card.Text>
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default Productivity;
