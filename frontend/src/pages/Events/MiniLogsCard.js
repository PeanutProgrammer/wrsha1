import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import "../Home/Home.css";
const handleMouseMove = (e) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const moveX = (x - centerX) / 6; // magnetic strength
  const moveY = (y - centerY) / 6;

  const rotateX = -(y - centerY) / 18; // parallax tilt
  const rotateY = (x - centerX) / 18;

  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
  el.style.setProperty(
    "--transform",
    `translate(${moveX}px, ${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  );
};

const handleMouseLeave = (e) => {
  const el = e.currentTarget;
  el.style.setProperty(
    "--transform",
    "translate(0px, 0px) rotateX(0deg) rotateY(0deg)"
  );
};

const MiniLogsCard = ({ token }) => {
  const navigate = useNavigate();

  const [logsCounts, setLogsCounts] = useState({
    guests: 0,
    experts: 0,
    delegates: 0,
  });
  const socket = io(process.env.REACT_APP_BACKEND_BASE_URL);

  const fetchVacationCounts = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/unit/unit-count`, {
        headers: { token },
      })
      .then((resp) => {
        setLogsCounts(resp.data);
      })
      .catch((err) => console.error("Error fetching vacations:", err));
  };

  useEffect(() => {
    fetchVacationCounts();

    const handleUpdate = () => {
      fetchVacationCounts();
    };

    socket.on("officersUpdated", handleUpdate);
    socket.on("ncosUpdated", handleUpdate);
    socket.on("soldiersUpdated", handleUpdate);

    return () => {
      socket.off("officersUpdated", handleUpdate);
      socket.off("ncosUpdated", handleUpdate);
      socket.off("soldiersUpdated", handleUpdate);
    };
  }, [token]);

  return (
    <div className="mini-calendar logs">
      <div className="mini-header">زيارات اليوم</div>

      <div className="vacation-sections">
        {/* Guests */}
        <div
          className="vac-section officer glow-hover"
          onClick={() => navigate("/dashboard/leader-guests")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">الزوار</div>
          <div className="vac-count">{logsCounts.guests}</div>
        </div>

        {/* Experts */}
        <div
          className="vac-section nco glow-hover"
          onClick={() => navigate("/dashboard/leader-experts")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">الخبراء</div>
          <div className="vac-count">{logsCounts.expertsInUnit}</div>
        </div>

        {/* Delegates */}
        <div
          className="vac-section soldier glow-hover"
          onClick={() => navigate("/dashboard/leader-delegates")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">المناديب</div>
          <div className="vac-count">{logsCounts.delegates}</div>
        </div>
      </div>

      {logsCounts.guests === 0 &&
        logsCounts.expertsInUnit === 0 &&
        logsCounts.delegates === 0 && (
          <div className="no-events">لا توجد زيارات اليوم</div>
        )}
    </div>
  );
};

export default MiniLogsCard;
