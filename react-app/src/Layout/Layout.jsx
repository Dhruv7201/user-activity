// src/components/Layout.jsx
import React from "react";
import NavBar from "./NavBar";
import { Container, Row } from "react-bootstrap";

function Layout({ children }) {
  return (
    <>
      <NavBar />

      <main id="main" className="main">
        {children}
      </main>
      <footer id="footer" class="footer">
        <div class="copyright">
          &copy; Copyright
          <strong>
            <span>Ethics Infotech</span>
          </strong>
          . All Rights Reserved
        </div>
      </footer>
    </>
  );
}

export default Layout;
