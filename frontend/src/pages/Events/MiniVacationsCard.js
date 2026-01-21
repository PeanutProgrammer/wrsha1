import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Home/Home.css";

const MiniVacationsCard = ({ token }) => {
  const [vacCounts, setVacCounts] = useState({
    officers: 0,
    ncos: 0,
    soldiers: 0,
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/unit/vacations-count`, {
        headers: { token },
      })
      .then((resp) => {
        // Expecting response like { officers: 5, ncos: 10, soldiers: 15 }
        setVacCounts(resp.data);
      })
      .catch((err) => console.error("Error fetching vacations:", err));
  }, [token]);

  return (
    <div className="mini-calendar vacations">
      <div className="mini-header">اجازات اليوم</div>

      <div className="vacation-sections">
        {/* Officers */}
        <div className="vac-section">
          <div className="vac-label">ضباط</div>
          <div className="vac-count">{vacCounts.officersCount}</div>
        </div>

        {/* NCOs */}
        <div className="vac-section">
          <div className="vac-label">ضباط الصف</div>
          <div className="vac-count">{vacCounts.ncosCount}</div>
        </div>

        {/* Soldiers */}
        <div className="vac-section">
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
