// src/components/Layout.jsx
import React from "react";
import NavBar from "./NavBar";

function Layout({ children }) {
  return (
    <>
      <NavBar />
      <main id="main" class="main">
        {children}
      </main>
    </>
  );
}

export default Layout;
