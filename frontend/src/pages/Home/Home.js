 import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import {
  FaUsers,
  FaClipboardList,
  FaUserShield,
  FaTasks,
  FaCalendarAlt,
  FaCalendar 
} from "react-icons/fa";
import logo from "../../assets/images/dashboard/logo2.png";
import axios from "axios";
import {io} from "socket.io-client";
import "./Home.css";
import MiniCalendarCard from "../Events/MiniCalendarCard";
import MiniVacationsCard from "../Events/MiniVacationsCard";

const Home = () => {
  const auth = getAuthUser();
  const navigate = useNavigate();
  const [countUnit, setCountUnit] = useState({
      countUnit: 0,
      civillians: 0,
      delegates: 0,
      experts: 0,
      guests: 0
  });

   // Fetch officers data and summary from the backend
    useEffect(() => {
      const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // backend port
  
      const fetchData = () => {

  
        // Fetch officers with search filter and pagination
        axios
          .get(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/unit/unit-count`,
            {
              headers: { token: auth.token },
            }
          )
          .then((resp) => {
            setCountUnit(resp.data);
          })
          .catch((err) => {
            console.error("Error fetching unit count", err);

          });
      };
  
      fetchData(); // Initial fetch on component mount
  
      socket.on("connect", () => {
        console.log("🟢 Connected to WebSocket:", socket.id);
      });
  
      socket.on("unitsUpdated", () => {
        console.log("📢 Units updated — refetching data...");
        fetchData(); // Re-fetch on update
      });
  
      return () => socket.disconnect();
    }, []);

  const leaderButtons = [
    {
      label: "تمام القوة",
      path: "/dashboard/leader-units",
      icon: <FaTasks />,
      count: `${countUnit.unitCount} / ${countUnit.unitInUnit}`,
    },
    {
      label: "تمام المدنيين",
      path: "/dashboard/leader-civillians",
      icon: <FaUsers />,
      count: ` ${countUnit.civillians} / ${countUnit.civilliansInUnit}`,
    },
    {
      label: "سجل الزوار",
      path: "/dashboard/leader-guests",
      icon: <FaUserShield />,
      count: countUnit.guests,
    },
    {
      label: "سجل الخبراء",
      path: "/dashboard/leader-experts",
      icon: <FaClipboardList />,
      count: `${countUnit.experts} / ${countUnit.expertsInUnit}`,
    },
    {
      label: "سجل المناديب",
      path: "/dashboard/leader-delegates",
      icon: <FaUsers />,
      count: countUnit.delegates,
    },
    {
      label: "الالتزامات",
      path: "/dashboard/past-workers",
      icon: <FaCalendarAlt />,
      count: 10,
    },
    {
      label: "اجازات",
      path: "/dashboard/leader-vacations",
      icon: <FaCalendar />,
      count: 5,
    }
  ];

  if (auth?.type !== "مبنى القيادة") {
    return (
      <div className="home-container">
        <div className="home-overlay"></div>
        <div className="home-content">
          <h1 className="home-title">الورش الرئيسية للأسلحة رقم (1)</h1>
          <img
            src={logo}
            alt="Main Armament Depot Logo"
            className="home-logo"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="home-container leader-bg">
      <div className="home-overlay"></div>
      <div className="home-content">
        {/* <h1 className="home-title">مبنى القيادة</h1> */}
        <img src={logo} alt="Leader Logo" className="home-logo" />

        <div className="leader-grid">
  {leaderButtons.map((btn, idx) => {
    if (btn.label === "الالتزامات") {
      return <MiniCalendarCard key={idx} token={auth.token} />;
    }
    if (btn.label === "اجازات") {
      return <MiniVacationsCard key={idx} token={auth.token} />;
    }
    return (
      <div
        key={idx}
        className="leader-card"
        onClick={() => navigate(btn.path)}
      >
        <div className="leader-icon">{btn.icon}</div>
        <span className="leader-label">{btn.label}</span>
        <span className="leader-badge">{btn.count}</span>
      </div>
    );
  })}
</div>

      </div>
    </div>
  );
};

export default Home;
