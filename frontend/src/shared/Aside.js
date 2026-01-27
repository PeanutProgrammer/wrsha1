import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";
import "../style/Aside.css";

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
            <li className="tabs">
              <Link to={"delegates"}>المناديب</Link>
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
              <Link to={"security-delegates"}>المناديب</Link>
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
              <Link to={"delegates"}>المناديب</Link>
            </li>
            <li className="tabs">
              <Link to={"calendar"}>الإلتزامات</Link>
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
              <Link to={"officers/manage-vacation"}>الاجازات</Link>
            </li>
            <li className="tabs">
              <Link to={"officers/manage-mission"}>المأموريات</Link>
            </li>
            <li className="tabs">
              <Link to={"officers/manage-course"}>الفرق</Link>
            </li>
          </>
        )}

        {auth?.type === "شؤون ادارية" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"ncos/manage"}>بيانات ضباط الصف</Link>
            </li>
            <li className="tabs">
              <Link to={"soldiers/manage"}>بيانات الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"ncos/manage-tmam"}>تمام ضباط الصف</Link>
            </li>
            <li className="tabs">
              <Link to={"soldiers/manage-tmam"}>تمام الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"shuoon/manage-vacation"}>الاجازات</Link>
            </li>
            <li className="tabs">
              <Link to={"shuoon/manage-mission"}>المأموريات</Link>
            </li>
            <li className="tabs">
              <Link to={"shuoon/manage-course"}>الفرق</Link>
            </li>
          </>
        )}

        {auth?.type === "مبنى القيادة" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-units"}>تمام الوحدة</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-officers"}>تمام الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-ncos"}>تمام ضباط الصف</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-soldiers"}>تمام الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-civillians"}>تمام المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-experts"}>سجل الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-delegates"}>سجل المناديب</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-guests"}>سجل الزوار</Link>
            </li>
            <li className="tabs">
              <Link to={"past-workers"}>العاملين السابقين</Link>
            </li>
          </>
        )}

                {auth?.type === "secretary" && (
          <>
            <li className="tabs">
              <Link to={"Home"}>الصفحة الرئيسية</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-units"}>تمام الوحدة</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-officers"}>تمام الضباط</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-ncos"}>تمام ضباط الصف</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-soldiers"}>تمام الجنود</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-civillians"}>تمام المدنيين</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-experts"}>سجل الخبراء</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-delegates"}>سجل المناديب</Link>
            </li>
            <li className="tabs">
              <Link to={"leader-guests"}>سجل الزوار</Link>
            </li>
            <li className="tabs">
              <Link to={"past-workers"}>العاملين السابقين</Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Aside;
