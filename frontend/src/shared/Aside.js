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
        {auth?.type === "بوابة" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"officers"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"ncos"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"soldiers"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"civillians"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"experts"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"guests"}>الزوار</Link>
            </li>
          </>
        )}

        {auth?.type === "قائد الامن" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"security-officers"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"security-ncos"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"security-soldiers"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"security-civillians"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"experts"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"security-guests"}>الزوار</Link>
            </li>
            <li className="tabs">
              <Link to={"security-unit"}>المتواجدين بالوحدة</Link>
            </li>
          </>
        )}

        {auth?.type === "admin" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"officers"}>الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"ncos"}>الصف ضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"soldiers"}>الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"civillians"}>المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"experts"}>الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"guests"}>الزوار</Link>
            </li>
            <li className="tabs">
              <Link to={"past-workers"}>العاملين السابقين</Link>
            </li>
            <li className="tabs">
              <Link to={"Home"}>الورش والأفرع</Link>
            </li>
            <li className="tabs">
              <Link to={"users"}>إدارة الحسابات</Link>
            </li>
          </>
        )}

        {auth?.type === "شؤون ضباط" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"officers/manage"}>بيانات الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"officers/manage-tmam"}>تمام الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"ncos"}>الاجازات</Link>
            </li>
            <li className="tabs">
              <Link to={"soldiers"}>المأموريات</Link>
            </li>
            <li className="tabs">
              <Link to={"experts"}>الفرق</Link>
            </li>
          </>
        )}

        {["مبنى القيادة", "شؤون ادارية"].includes(auth?.type) && (
          <li className="tabs">
            <Link to={"Home"}>Home</Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Aside;
