import React, { useState, useEffect } from "react";
import "./NCOsHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const NCOsHome = () => {
  const auth = getAuthUser();
    const [NCOs, setNCOs] = useState([]);

  
  console.log(auth.token);

  console.log(NCOs[0]);

  return (
  
    <div className="cards-container">
       {auth && auth.type === "admin" && (
      <>
      <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات ضباط الصف</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"NCOs"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaClipboardCheck className="card-icon" />
          <h2>تمام ضباط الصف</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"NCOs/Tmam"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaHistory className="card-icon" />
          <h2>سجل دخول / خروج ضباط الصف</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"NCOs/log"} className="button">Go</Link>
        )}
      </div>

        <div className="card">
          <div className="card-header">
            <FaSearch className="card-icon" />
            <h2>بحث</h2>
          </div>
          <Link to="NCOs/search" className="button">Go</Link>
        </div>
        </>
      )}
    {/* بوابة Cards */}
          {auth && auth.type === "بوابة" && (
            <>
              <div className="card">
                <div className="card-header">
                  <FaClipboardCheck className="card-icon" />
                  <h2>تسجيل دخول ضباط الصف</h2>
                </div>
                <Link to={"NCOs/Arrival"} className="button">تسجيل دخول</Link>
              </div>
    
              <div className="card">
                <div className="card-header">
                  <FaClipboardCheck className="card-icon" />
                  <h2>تسجيل خروج ضباط الصف</h2>
                </div>
                <Link to={"/dashboard/NCOsHome/NCOs/Departure"} className="button">تسجيل خروج</Link>
              </div>
            </>
          )}
    
        </div>
      );
    };
export default NCOsHome;
