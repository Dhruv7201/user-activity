// MonthSelector.jsx
import React from "react";
import { Button } from "react-bootstrap";

const MonthSelector = ({ selectedDate, handleDateChange }) => {
  const handleClearDate = () => {
    handleDateChange(new Date());
  };
  return (
    <>
      <div class="row">
        <div class="col-lg-12">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Select Month:</h5>
              <div class="row mb-3">
                <div class="col-3">
                  <input
                    type="month"
                    className="form-control"
                    value={
                      selectedDate
                        ? selectedDate.toISOString().split("T")[0].slice(0, 7)
                        : ""
                    }
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    max={new Date().toISOString().split("T")[0].slice(0, 7)}
                  />
                </div>
                <div class="col-3">
                  <Button
                    variant="btn btn-primary"
                    disabled={
                      !selectedDate ||
                      selectedDate.toDateString() === new Date().toDateString()
                    }
                    onClick={handleClearDate}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MonthSelector;