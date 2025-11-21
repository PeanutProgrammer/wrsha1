import React from "react";
import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>403 - Not Authorized</h1>
      <p>You don’t have permission to access this page.</p>
      <Link to="/dashboard/Home">Go Back Home</Link>
    </div>
  );
};

export default NotAuthorized;
