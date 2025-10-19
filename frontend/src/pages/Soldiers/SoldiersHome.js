import React, { useState, useEffect } from "react";
import "./SoldiersHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const SoldiersHome = () => {
  const auth = getAuthUser();
    const [Soldiers, setSoldiers] = useState([]);
  
  

    // useEffect(() => {
    //     // fetch the destinations from your API
    //   axios.get('http://localhost:4001/Officer/',  {
    //     headers: {
    //         token: auth.token
    //       }
    //     })
    //         .then(response => setSoldiers(response.data))
    //         .catch(error => console.error(error));

    // });


 

  return (
    <div className="cards-container">
      <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات الجنود</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Soldiers"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaClipboardCheck className="card-icon" />
          <h2>تمام الجنود</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Soldiers/Tmam"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaHistory className="card-icon" />
          <h2>سجل دخول / خروج الجنود</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Soldiers/log"} className="button">Go</Link>
        )}
      </div>

      {auth && auth.type === "admin" && (
        <div className="card">
          <div className="card-header">
            <FaSearch className="card-icon" />
            <h2>بحث</h2>
          </div>
          <Link to="Soldiers/search" className="button">Go</Link>
        </div>
      )}
    </div>
  );
};

export default SoldiersHome;
