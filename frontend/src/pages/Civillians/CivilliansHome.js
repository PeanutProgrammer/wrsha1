import React, { useState, useEffect } from "react";
import "./CivilliansHome.css";
import { Link } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import { FaUsers, FaClipboardCheck, FaHistory, FaSearch } from "react-icons/fa";

const CivilliansHome = () => {
  const auth = getAuthUser();
  

 

  return (
    <div className="cards-container">
      
     {auth && auth.type === "admin" && (
           <>
<div className="card">
        <div className="card-header">
          <FaUsers className="card-icon" />
          <h2>بيانات المدنيين</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"list"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaClipboardCheck className="card-icon" />
          <h2>تمام المدنيين</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"tmam"} className="button">Go</Link>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <FaHistory className="card-icon" />
          <h2>سجل دخول / خروج المدنيين</h2>
        </div>
        {auth && auth.type === "admin" && (
          <Link to={"log"} className="button">Go</Link>
        )}
      </div>

      {auth && auth.type === "admin" && (
        <div className="card">
          <div className="card-header">
            <FaSearch className="card-icon" />
            <h2>بحث</h2>
          </div>
          <Link to="search" className="button">Go</Link>
        </div>
      )}
             </>
           )}
         {/* بوابة Cards */}
               {auth && auth.type === "بوابة" && (
                 <>
                   <div className="card">
                     <div className="card-header">
                       <FaClipboardCheck className="card-icon" />
                       <h2>تسجيل دخول المدنيين</h2>
                     </div>
                     <Link to={"arrival"} className="button">تسجيل دخول</Link>
                   </div>
         
                   <div className="card">
                     <div className="card-header">
                       <FaClipboardCheck className="card-icon" />
                       <h2>تسجيل خروج المدنيين</h2>
                     </div>
                     <Link to={"departure"} className="button">تسجيل خروج</Link>
                   </div>
                 </>
               )}
         
             </div>
           );
         };

export default CivilliansHome;
