import React from "react";
import { Button, Row, Col } from "react-bootstrap";
import { useDateContext } from "../Context/DateContext";

function DateSelector() {
  const { date, handleDateChange } = useDateContext();
  const today = new Date();
  const isDateSet = date !== null && date !== undefined;

  const handleClearDate = () => {
    handleDateChange(today);
  };

  return (
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Select Date:</h5>
            <div class="row mb-3">
              <div class="col-lg-5 col-md-4 col-sm-5 col-4">
                <input
                  type="date"
                  class="form-control"
                  value={isDateSet ? date.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleDateChange(new Date(e.target.value))}
                  max={today.toISOString().split("T")[0]}
                />
              </div>
              <div class="col-lg-1 col-md-2 col-sm-1 col-2">
                <Button
                  variant="btn btn-primary"
                  disabled={
                    !isDateSet || date.toDateString() === today.toDateString()
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
  );
}

export default DateSelector;
