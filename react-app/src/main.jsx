import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { DateProvider } from "./Context/DateContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <DateProvider>
        <App />
      </DateProvider>
    </Router>
  </React.StrictMode>
);
