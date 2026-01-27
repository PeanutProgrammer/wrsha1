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

const MiniVacationsCard = ({ token }) => {
  const navigate = useNavigate();

  const [vacCounts, setVacCounts] = useState({
    officers: 0,
    ncos: 0,
    soldiers: 0,
  });
  const socket = io(process.env.REACT_APP_BACKEND_BASE_URL);

  const fetchVacationCounts = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/unit/vacations-count`, {
        headers: { token },
      })
      .then((resp) => {
        setVacCounts(resp.data);
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
    <div className="mini-calendar vacations">
      <div className="mini-header">اجازات اليوم</div>

      <div className="vacation-sections">
        {/* Officers */}
        <div
          className="vac-section officer glow-hover"
          onClick={() => navigate("/dashboard/officers-vacations")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">ضباط</div>
          <div className="vac-count">{vacCounts.officersCount}</div>
        </div>

        {/* NCOs */}
        <div
          className="vac-section nco glow-hover"
          onClick={() => navigate("/dashboard/ncos-vacations")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">ضباط الصف</div>
          <div className="vac-count">{vacCounts.ncosCount}</div>
        </div>

        {/* Soldiers */}
        <div
          className="vac-section soldier glow-hover"
          onClick={() => navigate("/dashboard/soldiers-vacations")}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="vac-label">جنود</div>
          <div className="vac-count">{vacCounts.soldiersCount}</div>
        </div>
      </div>

      {vacCounts.officersCount === 0 &&
        vacCounts.ncosCount === 0 &&
        vacCounts.soldiersCount === 0 && (
          <div className="no-events">لا توجد اجازات اليوم</div>
        )}
    </div>
  );
};

export default MiniVacationsCard;
