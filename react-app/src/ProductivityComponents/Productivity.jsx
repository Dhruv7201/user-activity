import React, { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import { get } from "../api/api";
import { useDateContext } from "../Context/DateContext";
import { Link } from "react-router-dom";

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
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{title}</h5>
          <div className="card-productivity">
            <p>
              {title === "Productivity" ? (
                `${productivity}%`
              ) : (
                <Link to={`/apps/${productivity}`} className="link-style">
                  {productivity}
                </Link>
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Productivity;
