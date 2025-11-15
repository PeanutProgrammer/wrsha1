import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";
import '../style/Aside.css';

const Aside = ({ setCollapsed, collapsed }) => {
  const auth = getAuthUser();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`aside ${collapsed ? "collapsed" : ""}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {!collapsed && (
        <>
          <div className="profile"></div>
          <h1>القائمة الرئيسية</h1>
        </>
      )}

      <ul>
        {auth?.type === ("بوابة") && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"OfficersHome"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"NCOsHome"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"SoldiersHome"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"CivilliansHome"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"ExpertsHome"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"GuestsHome"}>الزوار</Link>
            </li>
          </>
        )}

        {auth?.type === ("قائد الامن") && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"SecurityOfficers"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"NCOsHome"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"SoldiersHome"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"CivilliansHome"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"ExpertsHome"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"GuestsHome"}>الزوار</Link>
            </li>
          </>
        )}

        {auth?.type === "admin" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"OfficersHome"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"NCOsHome"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"SoldiersHome"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"CivilliansHome"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"ExpertsHome"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"GuestsHome"}>الزوار</Link>
            </li>
            <li className="tabs">
              <Link to={"PastWorkersHome"}>العاملين السابقين</Link>
            </li>
            <li className="tabs">
              <Link to={"Home"}>الورش والأفرع</Link>
            </li>
            <li className="tabs">
              <Link to={"Users"}>إدارة الحسابات</Link>
            </li>
          </>
        )}

        {["مبنى القيادة", "شؤون ضباط", "شؤون ادارية"].includes(
          auth?.type
        ) && (
          <li className="tabs">
            <Link to={"Home"}>Home</Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Aside;
