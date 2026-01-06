import React, { useState, useEffect } from "react";
import "./PastWorkersHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const PastWorkersHome = () => {
  const auth = getAuthUser();
  const [officers, setOfficers] = useState([]);

  console.log(auth.token);

  console.log(officers[0]);

  return (
    <div className="cards-container">
      <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات الضباط السابقين</h2>
        </div>
        <Link to={"officers"} className="button">
          Go
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <FaClipboardCheck className="card-icon" />
          <h2>بيانات ضباط الصف السابقين</h2>
        </div>
        <Link to={"ncos"} className="button">
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
    </div>
  );
};

export default PastWorkersHome;
