import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import DateRange from "../Utils/DateRange";
import Productivity from "../ProductivityComponents/Productivity";
import ProductivityPie from "../ProductivityComponents/ProductivityPie";
import TopList from "../ProductivityComponents/TopList";
import { useEffect } from "react";
import { isTokenValid } from "../Utils/authUtils";
import { removeToken } from "../Utils/authUtils";
import { useNavigate } from "react-router-dom";

const ProductivityPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const tokenValid = isTokenValid();

    if (!tokenValid) {
      removeToken();
      navigate("/", {
        state: { error: "Session expired. Please log in again." },
      });
    }
  }, [navigate]);

  return (
    <>
      <div class="pagetitle">
        <h1>Productivity</h1>
      </div>
      <DateRange />
      <Row>
        <Col sm={3}>
          <Productivity url="/productivity" title="Productivity" />
        </Col>
        <Col sm={3}>
          <Productivity url="/topApp" title="Top App" />
        </Col>
        <Col sm={3}>
          <Productivity url="/topTab" title="Top Tab" />
        </Col>
        <Col sm={3}>
          <Productivity url="/topCategory" title="Top Category" />
        </Col>
      </Row>
      <Row>
        <Col sm={5}>
          <ProductivityPie />
        </Col>
        <Col sm={7}>
          <Row>
            <Col sm={12}>
              <TopList order="0" title="Most Productive User" />
            </Col>
          </Row>
          <Row>
            <Col sm={12}>
              <TopList order="1" title="Least Productive User" />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default ProductivityPage;
