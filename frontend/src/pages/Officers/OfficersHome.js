import React, { useState, useEffect } from "react";
import "./OfficersHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const OfficersHome = () => {
  const auth = getAuthUser();
  const [officers, setOfficers] = useState([]);

  console.log(auth.token);

  console.log(officers[0]);

  return (
    <div className="cards-container">
      {/* Admin Cards */}
      {auth && auth.type === "admin" && (
        <>
          <div className="card">
            <div className="card-header">
              <FaUsers className="card-icon" />
              <h2>بيانات الضباط</h2>
            </div>
            <Link to={"list"} className="button">
              Go
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تمام الضباط</h2>
            </div>
            <Link to={"tmam"} className="button">
              Go
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaHistory className="card-icon" />
              <h2>سجل دخول / خروج الضباط</h2>
            </div>
            <Link to={"log"} className="button">
              Go
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaSearch className="card-icon" />
              <h2>بحث</h2>
            </div>
            <Link to="search" className="button">
              Go
            </Link>
          </div>
        </>
      )}

      {/* بوابة Cards */}
      {auth && auth.type === "بوابة" && (
        <>
          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تسجيل دخول الضباط</h2>
            </div>
            <Link to={"arrival"} className="button">
              تسجيل دخول
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تسجيل خروج الضباط</h2>
            </div>
            <Link to={"departure"} className="button">
              تسجيل خروج
            </Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تسجيل الضباط QR Code</h2>
            </div>
            <Link to={"scan"} className="button">
              تسجيل 
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficersHome;
