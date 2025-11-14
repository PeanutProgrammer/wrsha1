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
            <Link to={"Officers"} className="button">Go</Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تمام الضباط</h2>
            </div>
            <Link to={"Officers/Tmam"} className="button">Go</Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaHistory className="card-icon" />
              <h2>سجل دخول / خروج الضباط</h2>
            </div>
            <Link to={"Officers/log"} className="button">Go</Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaSearch className="card-icon" />
              <h2>بحث</h2>
            </div>
            <Link to="Officers/search" className="button">Go</Link>
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
            <Link to={"Officers/arrival"} className="button">تسجيل دخول</Link>
          </div>

          <div className="card">
            <div className="card-header">
              <FaClipboardCheck className="card-icon" />
              <h2>تسجيل خروج الضباط</h2>
            </div>
            <Link to={"Officers/departure"} className="button">تسجيل خروج</Link>
          </div>
        </>
      )}

    </div>
  );
};

export default OfficersHome;
