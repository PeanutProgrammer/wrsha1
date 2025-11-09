import React, { useState, useEffect } from "react";
import "./ExpertsHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const ExpertsHome = () => {
  const auth = getAuthUser();
  
  

 
 

  return (
    <div className="cards-container">
       {auth && auth.type === "admin" && (
           <> <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات الخبراء</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Experts"} className="button">Go</Link>
        )}
      </div>


      <div className="card">
        <div className="card-header">
          <FaHistory className="card-icon" />
          <h2>سجل دخول / خروج الخبراء</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Experts/log"} className="button">Go</Link>
        )}
      </div>

      {auth && auth.type === "admin" && (
        <div className="card">
          <div className="card-header">
            <FaSearch className="card-icon" />
            <h2>بحث</h2>
          </div>
          <Link to="Experts/search" className="button">Go</Link>
        </div>
      )}</>
    )}
          {/* بوابة Cards */}
           {auth && auth.type === "بوابة" && (
                           <>
                             <div className="card">
                               <div className="card-header">
                                 <FaClipboardCheck className="card-icon" />
                                 <h2>تسجيل دخول</h2>
                               </div>
                               <Link to={"Experts/Arrival"} className="button">تسجيل دخول</Link>
                             </div>
                   
                             <div className="card">
                               <div className="card-header">
                                 <FaClipboardCheck className="card-icon" />
                                 <h2>تسجيل خروج</h2>
                               </div>
                               <Link to={"Experts/Departure"} className="button">تسجيل خروج</Link>
                             </div>
                           </>
                         )}
                   
                       </div>
                     );
                   };
          

export default ExpertsHome;
