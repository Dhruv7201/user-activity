// src/App.jsx
import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout/Layout";

import DashboardPage from "./pages/DashboardPage";
import AttendancePage from "./pages/AttendancePage";
import ProductivityPage from "./pages/ProductivityPage";
import Screenshot from "./pages/Screenshot";
import AppsPage from "./pages/AppsPage";
import AppDetails from "./AppsComponents/AppDetails";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import EmployeeDetailsData from "./EmployeeComponents/EmployeeDetailsData";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AddToGroupPage from "./SettingsComponents/AddToGroupPage";
import UnproductiveAppPage from "./pages/UnproductiveAppPage";
import AddUserPage from "./pages/AddUserPage";
import ManageTeamsPage from "./pages/ManageTeamsPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import Error from "./pages/Error";
import "chart.js/auto";

function App() {
  return (
    <div className="scroll-container">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <DashboardPage />
            </Layout>
          }
        />
        <Route
          path="/attendance"
          element={
            <Layout>
              <AttendancePage />
            </Layout>
          }
        />
        <Route
          path="/productivity"
          element={
            <Layout>
              <ProductivityPage />
            </Layout>
          }
        />
        <Route
          path="/screenshots"
          element={
            <Layout>
              <Screenshot />
            </Layout>
          }
        />
        <Route
          path="/apps"
          element={
            <Layout>
              <AppsPage />
            </Layout>
          }
        />
        <Route
          path="/apps/:name"
          element={
            <Layout>
              <AppDetails />
            </Layout>
          }
        />
        <Route
          path="/employee"
          element={
            <Layout>
              <EmployeeDetailsPage />
            </Layout>
          }
        />
        <Route
          path="/employee/:name"
          element={
            <Layout>
              <EmployeeDetailsData />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <ReportsPage />
            </Layout>
          }
        />
        <Route
          path="/reports/:link"
          element={
            <Layout>
              <ReportsPage />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <SettingsPage />
            </Layout>
          }
        />
        <Route
          path="/settings/add-to-group"
          element={
            <Layout>
              <AddToGroupPage />
            </Layout>
          }
        />
        <Route
          path="/settings/unproductive-apps"
          element={
            <Layout>
              <UnproductiveAppPage />
            </Layout>
          }
        />
        <Route
          path="/settings/add-user"
          element={
            <Layout>
              <AddUserPage />
            </Layout>
          }
        />
        <Route
          path="/settings/manage-teams"
          element={
            <Layout>
              <ManageTeamsPage />
            </Layout>
          }
        />
        <Route
          path="/settings/manage-users"
          element={
            <Layout>
              <ManageUsersPage />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <Error />
            </Layout>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
