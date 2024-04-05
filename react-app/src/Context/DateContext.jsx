import React, { createContext, useState, useContext, useEffect } from "react";

const DateContext = createContext();

export function useDateContext() {
  return useContext(DateContext);
}

export function DateProvider({ children }) {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [date, setDate] = useState(null);

  useEffect(() => {
    const currentDate = new Date();
    setFromDate(getFromDate(currentDate));
    setToDate(currentDate);
    setDate(currentDate);
  }, []);

  const getFromDate = (toDate) => {
    const fromDate = new Date(toDate);
    fromDate.setDate(toDate.getDate() - 6);
    return fromDate;
  };

  const handleFromDateChange = (newFromDate) => {
    if (!newFromDate || isNaN(newFromDate.getTime())) return;
    setFromDate(newFromDate);
  };

  const handleToDateChange = (newToDate) => {
    if (!newToDate || isNaN(newToDate.getTime())) return;
    setToDate(newToDate);
  };

  const handleDateChange = (newDate) => {
    if (!newDate || isNaN(newDate.getTime())) return;
    setDate(newDate);
  };

  const formatDateToYmd = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const dateYmd = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const contextValue = {
    fromDate,
    toDate,
    date,
    fromDateYmd: formatDateToYmd(fromDate),
    toDateYmd: formatDateToYmd(toDate),
    dateYmd: dateYmd(date),
    handleFromDateChange,
    handleToDateChange,
    handleDateChange,
  };

  return (
    <DateContext.Provider value={contextValue}>{children}</DateContext.Provider>
  );
}
