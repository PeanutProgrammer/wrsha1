import React, { useState, useEffect } from "react";
import "./PastWorkersHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const PastWorkersHome = () => {
  const auth = getAuthUser();
    const [officers, setOfficers] = useState([]);
  

    // useEffect(() => {
    //     // fetch the destinations from your API
    //   axios.get('http://localhost:4001/Officer/',  {
    //     headers: {
    //         token: auth.token
    //       }
    //     })
    //         .then(response => setOfficers(response.data))
    //         .catch(error => console.error(error));

    // });

    

   


   
  
  
  
  

  
  console.log(auth.token);

  console.log(officers[0]);

  return (
    <div className="cards-container">
      <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات الضباط السابقين</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"PastOfficers"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaClipboardCheck className="card-icon" />
          <h2>بيانات ضباط الصف السابقين</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Officers/Tmam"} className="button">Go</Link>
        )}
      </div>

      {/* <div className="card">
        <div className="card-header">
          <FaHistory className="card-icon" />
          <h2>سجل دخول / خروج الضباط</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Officers/log"} className="button">Go</Link>
        )}
      </div> */}

      {auth && auth.type === "admin" && (
        <div className="card">
          <div className="card-header">
            <FaSearch className="card-icon" />
            <h2>بحث</h2>
          </div>
          <Link to="Officers/search" className="button">Go</Link>
        </div>
      )}
    </div>
  );
};

export default PastWorkersHome;
