import React, { useState, useEffect } from "react";
import "./GuestsHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import axios from "axios";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const GuestsHome = () => {
  const auth = getAuthUser();
  
  



 

  return (
    <div className="cards-container">
        {auth && auth.type === "admin" && (
            <> 
            <div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات الزوار</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"Guests"} className="button">Go</Link>
        )}
      </div>
      </>
        )}

 {/* بوابة Cards */}
           {auth && auth.type === "بوابة" && (
                           <>
                             <div className="card">
                               <div className="card-header">
                                 <FaClipboardCheck className="card-icon" />
                                 <h2>تسجيل دخول</h2>
                               </div>
                               <Link to={"Guests/Arrival"} className="button">تسجيل دخول</Link>
                             </div>
                   
                             <div className="card">
                               <div className="card-header">
                                 <FaClipboardCheck className="card-icon" />
                                 <h2>تسجيل خروج</h2>
                               </div>
                               <Link to={"Guests/Departure"} className="button">تسجيل خروج</Link>
                             </div>
                           </>
                         )}
                   
                       </div>
                     );
                   };

export default GuestsHome;
