import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../../helper/Storage";
import { FaTasks, FaCalendarAlt } from "react-icons/fa";
import axios from "axios";
import "../Home/Home.css";

const MiniCalendarCard = ({ token }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/event`, {
        headers: { token },
      })
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const twoDaysLater = new Date(today);
        twoDaysLater.setDate(today.getDate() + 2);
        twoDaysLater.setHours(23, 59, 59, 999);

        const upcoming = res.data.filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);

          return eventDate >= today && eventDate <= twoDaysLater;
        });

        setEvents(upcoming);
      })
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div
      className="leader-card mini-calendar wide"
      onClick={() => navigate("/dashboard/calendar")}
    >
      <div className="leader-icon">
        <FaCalendarAlt />
      </div>
      <span className="leader-label">الالتزامات</span>
      <div className="calendar-events">
        {events.length > 0 ? (
          events.map((e) => {
            const date = new Date(e.date);
            return (
              <div key={e.id} className="calendar-event">
                <span className="event-date">
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
                    <span className="event-title"> {e.name}</span>
                    <span className="event-location"> في {e.location}</span>
              </div>
            );
          })
        ) : (
          <span className="no-events">لا يوجد التزامات قريبة</span>
        )}
      </div>
    </div>
  );
};

export default MiniCalendarCard;
