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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showDeleteError, setShowDeleteError] = useState(false);

  const [newEvent, setNewEvent] = useState({
    name: "",
    location: "",
    description: "",
  });

  const fetchEvents = () => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/event`, {
        headers: { token: auth.token },
      })
      .then((res) => {
        setEvents(res.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchEvents();
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

        {(auth?.type === "admin" || auth?.type === "secretary") && (
          <button
            className="btn btn-success btn-sm mb-2"
            onClick={() => setShowAddEvent(true)}
          >
            + إضافة إلتزام
          </button>
        )}

        {getEventsForDate(selectedDate).length > 0 ? (
          getEventsForDate(selectedDate).map((e) => (
            <div
              key={e.id}
              className="calendar-event-card d-flex justify-content-between align-items-center"
            >
              <div>
                <div className="event-name">{e.name}</div>
                <div className="event-location">📍 {e.location}</div>
                <div className="event-description">{e.description}</div>
              </div>

              {/* X button */}
                      {(auth?.type === "admin" || auth?.type === "secretary") && (

              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  setEventToDelete(e);
                  setShowDeleteModal(true);
                }}
                style={{
                  padding: "0 6px",
                  fontWeight: "bold",
                  lineHeight: 1,
                  borderRadius: "50%",
                  minWidth: "24px",
                  height: "24px",
                }}
              >
                ✖
              </button>
                      )}
            </div>
          ))
        ) : (
          <div className="no-events">لا يوجد إلتزامات</div>
        )}
        {/* Delete Confirmation Modal */}
      </div>

      <Modal show={showAddEvent} onHide={() => setShowAddEvent(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>إضافة إلتزام جديد</Modal.Title>
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
                .then(() => {
                  fetchEvents(); // 👈 REFRESH DATA
                  setShowAddEvent(false);
                  setNewEvent({ name: "", location: "", description: "" });
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                })

                .catch(console.error);
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>اسم الإلتزام *</Form.Label>
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

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          هل أنت متأكد من حذف الإلتزام "{eventToDelete?.name}"؟
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            إلغاء
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              axios
                .delete(
                  `${process.env.REACT_APP_BACKEND_BASE_URL}/event/${eventToDelete.id}`,
                  { headers: { token: auth.token } }
                )
                .then(() => {
                  fetchEvents();
                  setShowDeleteModal(false);
                  setEventToDelete(null);

                  setShowDeleteSuccess(true);
                  setTimeout(() => setShowDeleteSuccess(false), 3000);
                })

                .catch((err) => {
                  console.error("Delete failed:", err);

                  setShowDeleteModal(false);
                  setShowDeleteError(true);
                  setTimeout(() => setShowDeleteError(false), 3000);
                });
            }}
          >
            حذف
          </Button>
        </Modal.Footer>
      </Modal>

      {showSuccess && (
        <div className="calendar-toast-success">
          <div className="toast-icon">✔</div>
          <div className="toast-text">تمت إضافة الإلتزام بنجاح</div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="calendar-toast-delete success">
          <div className="toast-icon">🗑</div>
          <div className="toast-text">تم حذف الإلتزام بنجاح</div>
        </div>
      )}

      {showDeleteError && (
        <div className="calendar-toast-delete error">
          <div className="toast-icon">⚠</div>
          <div className="toast-text">فشل حذف الإلتزام</div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
