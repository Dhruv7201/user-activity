import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useDateContext } from "../Context/DateContext.jsx";

const dateFormat = "yyyy-MM-dd";

function DateRange() {
  const [disable, setDisable] = useState(false);
  const { fromDate, toDate, handleFromDateChange, handleToDateChange } =
    useDateContext();
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const handleClearDate = () => {
    handleFromDateChange(sevenDaysAgo);
    handleToDateChange(today);
  };

  useEffect(() => {
    if (
      fromDate &&
      toDate &&
      fromDate.toDateString() === sevenDaysAgo.toDateString() &&
      toDate.toDateString() === today.toDateString()
    ) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [fromDate, toDate, sevenDaysAgo, today]);

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Select Date Range:</h5>
            <div className="row mb-3">
              <div className="col-lg-5 col-md-4 col-sm-5 col-4">
                <input
                  type="date"
                  className="form-control"
                  value={fromDate ? fromDate.toISOString().split("T")[0] : ""}
                  onChange={(e) =>
                    handleFromDateChange(new Date(e.target.value))
                  }
                  max={today.toISOString().split("T")[0]}
                />
              </div>
              <label className="col-lg-1 col-md-2 col-sm-1 col-2 text-center col-form-label">
                To
              </label>
              <div className="col-lg-5 col-md-4 col-sm-5 col-4">
                <input
                  type="date"
                  className="form-control"
                  value={toDate ? toDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleToDateChange(new Date(e.target.value))}
                  max={today.toISOString().split("T")[0]}
                  min={fromDate ? fromDate.toISOString().split("T")[0] : ""}
                />
              </div>
              <div className="col-lg-1 col-md-2 col-sm-1 col-2">
                <Button
                  onClick={handleClearDate}
                  className="btn btn-primary"
                  disabled={disable}
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

export default DateRange;
