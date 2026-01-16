import React from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import {
  FaUsers,
  FaClipboardList,
  FaUserShield,
  FaTasks,
} from "react-icons/fa";
import logo from "../../assets/images/dashboard/logo2.png";
import "./Home.css";
import MiniCalendarCard from "../Events/MiniCalendarCard";

const Home = () => {
  const auth = getAuthUser();
  const navigate = useNavigate();

  const leaderButtons = [
    {
      label: "تمام القوة",
      path: "/dashboard/leader-units",
      icon: <FaTasks />,
      count: 128,
    },
    {
      label: "تمام المدنيين",
      path: "/dashboard/leader-civillians",
      icon: <FaUsers />,
      count: 72,
    },
    {
      label: "سجل الزوار",
      path: "/dashboard/leader-guests",
      icon: <FaUserShield />,
      count: 35,
    },
    {
      label: "سجل الخبراء",
      path: "/dashboard/leader-experts",
      icon: <FaClipboardList />,
      count: 18,
    },
    {
      label: "سجل المناديب",
      path: "/dashboard/leader-delegates",
      icon: <FaUsers />,
      count: 22,
    },
    {
      label: "الالتزامات",
      path: "/dashboard/past-workers",
      icon: <FaTasks />,
      count: 10,
    },
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
        <h1 className="home-title">مبنى القيادة</h1>
        <img src={logo} alt="Leader Logo" className="home-logo" />

        <div className="leader-grid">
          {leaderButtons.map((btn, idx) => {
            if (btn.label === "الالتزامات") {
              return <MiniCalendarCard key={idx} token={auth.token} />;
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
