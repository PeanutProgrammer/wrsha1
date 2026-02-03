import React, { useEffect, useState } from "react";
import "../style/Header.css";
import { getAuthUser, removeAuthUser } from "../helper/Storage";
import { useNavigate, useLocation, replace } from "react-router-dom";
import { FaHome, FaUserShield, FaUsers, FaClipboardList } from "react-icons/fa";
import axios from "axios";

const Header = ({ collapsed }) => {
  const auth = getAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [dateTime, setDateTime] = useState(new Date());
  const [showLogout, setShowLogout] = useState(false);

  const isHomePage = ["/dashboard", "/dashboard/Home"].includes(
    location.pathname
  );

  const logout = () => {
    axios.post(
      `${process.env.REACT_APP_BACKEND_BASE_URL}/auth/logout`,
      {},
      {
        headers: { token: auth.token },
      }
    );
    removeAuthUser();
    navigate("/");
  };

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = dateTime.toLocaleDateString("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = dateTime.toLocaleTimeString("ar-EG");

  const ENTITY_MAP = {
    officers: { label: "الضباط", icon: <FaUserShield /> },
    ncos: { label: "ضباط الصف", icon: <FaUsers /> },
    soldiers: { label: "الجنود", icon: <FaUsers /> },
    civillians: { label: "المدنيين", icon: <FaUsers /> },
    experts: { label: "الخبراء", icon: <FaUsers /> },
    guests: { label: "الزوار", icon: <FaUsers /> },
    delegates: { label: "المناديب", icon: <FaUsers /> },
    "past-workers": { label: "العاملين السابقين", icon: <FaUsers /> },
    users: { label: "إدارة الحسابات", icon: <FaUsers /> },

    "security-officers": { label: "الضباط", icon: <FaUserShield /> },
    "security-ncos": { label: "ضباط الصف", icon: <FaUsers /> },
    "security-soldiers": { label: "الجنود", icon: <FaUsers /> },
    "security-civillians": { label: "المدنيين", icon: <FaUsers /> },
    "security-experts": { label: "الخبراء", icon: <FaUsers /> },
    "security-guests": { label: "الزوار", icon: <FaUsers /> },
    "security-delegates": { label: "المناديب", icon: <FaUsers /> },
    "security-unit": { label: "الوحدة", icon: <FaHome /> },

    "leader-units": { label: "تمام الوحدة", icon: <FaClipboardList /> },
    "leader-officers": { label: "تمام الضباط", icon: <FaClipboardList /> },
    "leader-ncos": { label: "تمام ضباط الصف", icon: <FaClipboardList /> },
    "leader-soldiers": { label: "تمام الجنود", icon: <FaClipboardList /> },
    "leader-civillians": { label: "تمام المدنيين", icon: <FaClipboardList /> },
    "leader-experts": { label: "تمام الخبراء", icon: <FaClipboardList /> },
    "leader-guests": { label: "تمام الزوار", icon: <FaClipboardList /> },
    "leader-delegates": { label: "تمام المناديب", icon: <FaClipboardList /> },
    "leader-vacations": { label: "إجازات الوحدة", icon: <FaClipboardList /> },
    "officers-vacations": { label: "إجازات الضباط", icon: <FaClipboardList /> },
    "ncos-vacations": { label: "إجازات ضباط الصف", icon: <FaClipboardList /> },
    "soldiers-vacations": { label: "إجازات الجنود", icon: <FaClipboardList /> },
    "officer-vacation-log": { label: "سجل إجازات الضباط", icon: <FaClipboardList /> },
    "manage-duty": { label: "نوبتجية الضباط", icon: <FaClipboardList /> },
    "officer-view": { label: "عرض الضباط", icon: <FaClipboardList /> },
    "leader-officer-duty": { label: "نوبتجية الضباط ", icon: <FaClipboardList /> },

    calendar: { label: "الإلتزامات", icon: <FaClipboardList /> },

    shuoon: { label: "الشؤون الإدارية", icon: <FaClipboardList /> },
  };

  const ACTION_MAP = {
    list: "عرض",
    add: "إضافة",
    manage: "إدارة",
    tmam: "التمام",
    log: "السجل",
    search: "بحث",
    arrival: "وصول",
    departure: "مغادرة",
    details: "تفاصيل",
  };

  const CONTEXT_MAP = {
    "manage-tmam": "التمام",
    "manage-vacation": "الإجازات",
    "manage-mission": "المأموريات",
    "manage-course": "الفرق",
  };

  const pathSegments = location.pathname
    .replace("/dashboard", "")
    .split("/")
    .filter(Boolean);

  const breadcrumbs = [];
  let accumulatedPath = "/dashboard";

  const filteredSegments = pathSegments.filter(
    (segment) => !/^\d+$/.test(segment)
  );

  filteredSegments.forEach((segment, idx) => {
    let label = "";
    let icon = <FaClipboardList />;

    if (ENTITY_MAP[segment]) {
      label = ENTITY_MAP[segment].label;
      icon = ENTITY_MAP[segment].icon;
    } else if (CONTEXT_MAP[segment]) {
      label = CONTEXT_MAP[segment];
    } else if (ACTION_MAP[segment]) {
      label = ACTION_MAP[segment];
    }

    const isLast = idx === filteredSegments.length - 1;

    // Compute the path to navigate to for this breadcrumb
    // Only include segments UP TO this one, skip numeric IDs
    const navPathSegments = pathSegments.slice(
      0,
      pathSegments.indexOf(segment) + 1
    );
    const navPath = "/dashboard/" + navPathSegments.join("/");

    breadcrumbs.push(
      <span
        key={idx}
        className={`breadcrumb-item ${!isLast ? "clickable" : ""}`}
        onClick={() => {
          console.log("Breadcrumb clicked:", segment);
          console.log("Navigating to:", navPath);
          if (!isLast) navigate(navPath);
        }}
        style={{ cursor: !isLast ? "pointer" : "default" }}
      >
        {icon} <span>{label}</span>
      </span>
    );
  });

  return (
    <header className={`app-header ${collapsed ? "collapsed" : ""}`}>
      {/* LEFT → Date & Time */}
      <div className="header-left">
        <div className="day">{formattedDate}</div>
        <div className="time">{formattedTime}</div>
      </div>
      {/* CENTER → Breadcrumb or Welcome */}
      {/* Determine if we are on the homepage */}
      <div className="header-center breadcrumb">
        {isHomePage ? (
          <>
            مرحباً، <span>{auth.name}</span>
          </>
        ) : (
          breadcrumbs.reduce((prev, curr) => [prev, " / ", curr])
        )}
      </div>

      {/* RIGHT → Return Home + Logout */}
      <div className="header-right-actions">
        {/* Return to Homepage button */}
        {!isHomePage && (
          <button
            className="return-home-btn"
            onClick={() => navigate("/dashboard/Home")}
          >
            <FaHome className="home-icon" />
            الرئيسية
          </button>
        )}

        {/* Logout button */}
        <div
          className="header-right logout-btn"
          onClick={() => setShowLogout(true)}
        >
          تسجيل خروج
        </div>
      </div>

      {showLogout && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <h3>تأكيد تسجيل الخروج</h3>
            <p>هل أنت متأكد أنك تريد تسجيل الخروج؟</p>

            <div className="actions">
              <button className="cancel" onClick={() => setShowLogout(false)}>
                إلغاء
              </button>
              <button className="confirm" onClick={logout}>
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
