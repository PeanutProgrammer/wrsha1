import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import "./Calendar.css";
import { Link, useParams } from "react-router-dom";
import { Modal, Button, Form } from "react-bootstrap";

const Calendar = () => {
  const auth = getAuthUser();

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [showAddEvent, setShowAddEvent] = useState(false);

  const [newEvent, setNewEvent] = useState({
    name: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/event`, {
        headers: { token: auth.token },
      })
      .then((res) => setEvents(res.data))
      .catch(console.error);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getEventsForDate = (date) =>
    events.filter((e) => {
      const d = new Date(e.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === date.getTime();
    });

  const weekdays = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

  const daysInMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    1
  );
  const startDay = firstDayOfMonth.getDay();

  // Build calendar cells
  const calendarCells = [];

  // Empty cells before the first day
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} className="calendar-day empty"></div>
    );
  }

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      i
    );
    const dayEvents = getEventsForDate(date);
    const isToday = date.getTime() === today.getTime();

    calendarCells.push(
      <div
        key={i}
        className={`calendar-day 
          ${isToday ? "today" : ""} 
          ${date.getTime() === selectedDate.getTime() ? "selected" : ""}
          ${dayEvents.length > 0 ? "has-events" : ""}
        `}
        onClick={() => {
          const clickedDate = new Date(date);
          clickedDate.setHours(0, 0, 0, 0);
          setSelectedDate(clickedDate);
        }}
      >
        <span className="day-number">{i}</span>
        {dayEvents.length > 0 && <span className="event-dot"></span>}
      </div>
    );
  }

  // Handlers to navigate months
  const handlePrevMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(selectedDate.getMonth() - 1);
    prevMonth.setDate(1);
    prevMonth.setHours(0, 0, 0, 0);
    setSelectedDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(selectedDate.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    setSelectedDate(nextMonth);
  };

  return (
    <div className="calendar-page">
      <h1 className="calendar-title">📅 التقويم</h1>

      {/* Month Header with Navigation */}
      <div className="calendar-header">
        <button className="month-nav" onClick={handlePrevMonth}>
          {"<"}
        </button>
        <span>
          {selectedDate.toLocaleDateString("ar-EG", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button className="month-nav" onClick={handleNextMonth}>
          {">"}
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {calendarCells}
      </div>

      {/* Events for selected day */}
      <div className="calendar-events-panel">
        <h3>إلتزامات {selectedDate.toLocaleDateString("ar-EG")}</h3>

        {auth?.type === "admin" && (
          <button
            className="btn btn-success btn-sm mb-2"
            onClick={() => setShowAddEvent(true)}
          >
            + إضافة حدث
          </button>
        )}

        {getEventsForDate(selectedDate).length > 0 ? (
          getEventsForDate(selectedDate).map((e) => (
            <div key={e.id} className="calendar-event-card">
              <div className="event-name">{e.name}</div>
              <div className="event-location">📍 {e.location}</div>
            </div>
          ))
        ) : (
          <div className="no-events">لا يوجد إلتزامات</div>
        )}
      </div>


       <Modal
  show={showAddEvent}
  onHide={() => setShowAddEvent(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>إضافة حدث جديد</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form
      onSubmit={(e) => {
        e.preventDefault();

        axios
          .post(
            `${process.env.REACT_APP_BACKEND_BASE_URL}/event`,
            {
              ...newEvent,
              date: selectedDate,
            },
            {
              headers: { token: auth.token },
            }
          )
          .then((res) => {
            setEvents([...events, res.data]);
            setShowAddEvent(false);
            setNewEvent({ name: "", location: "", description: "" });
          })
          .catch(console.error);
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>اسم الحدث *</Form.Label>
        <Form.Control
          type="text"
          required
          value={newEvent.name}
          onChange={(e) =>
            setNewEvent({ ...newEvent, name: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>المكان</Form.Label>
        <Form.Control
          type="text"
          value={newEvent.location}
          onChange={(e) =>
            setNewEvent({ ...newEvent, location: e.target.value })
          }
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>التاريخ</Form.Label>
        <Form.Control
          type="text"
          value={selectedDate.toLocaleDateString("ar-EG")}
          disabled
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>الوصف</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowAddEvent(false)}
        >
          إلغاء
        </Button>
        <Button type="submit" variant="success">
          حفظ
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

    </div>
  );
};

export default Calendar;
