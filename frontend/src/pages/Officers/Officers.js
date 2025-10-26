import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";


const Officers = () => {
  const auth = getAuthUser();
  const [officers, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(10); // Number of records per page
  const [showConfirm, setShowConfirm] = useState(false);  // Modal state
  const [selectedOfficer, setSelectedOfficer] = useState(null);  // Selected officer for deletion

useEffect(() => {
  const socket = io("http://localhost:4001"); // your backend port

  // 🔁 Initial fetch
  const fetchData = () => {
    axios
      .get("http://localhost:4001/officer/", {
        headers: { token: auth.token },
      })
      .then((resp) => {
        setOfficers({
          ...officers,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setOfficers({
          ...officers,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
        });
      });
  };

  fetchData(); // ✅ Initial fetch on component mount

  socket.on("connect", () => {
    console.log("🟢 Connected to WebSocket:", socket.id);
  });

  socket.on("officersUpdated", () => {
    console.log("📢 Officers updated — refetching data...");

    // 🔔 Play sound
    const audio = new Audio("/sounds/chime.wav");
    audio.play().catch((err) => console.log("Audio play failed:", err));

    fetchData(); // ✅ Re-fetch on update
  });

  return () => socket.disconnect();
}, []);


  

    // Show confirmation modal before deleting
  const handleDeleteClick = (officer) => {
    setSelectedOfficer(officer);
    setShowConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (!selectedOfficer) return;

    axios
      .delete('http://localhost:4001/Officer/' + selectedOfficer.mil_id, {
        headers: { token: auth.token },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedOfficer(null);
        setOfficers({ ...officers, reload: officers.reload + 1 });
      })
      .catch((err) => {
        setOfficers({
          ...officers,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong. Please try again later.",
        });
        setShowConfirm(false);
      });
  };

  // Get current records for the current page
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = officers.results.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(officers.results.length / recordsPerPage);

  // Generate an array of page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة الضباط</h3>
        <Link to={"AddOfficers"} className="btn btn-success mb-4">
          إنشاء ضابط جديد +
        </Link>
      </div>

      {officers.err && (
        <Alert variant="danger" className="p-2">
          {officers.err}
        </Alert>
      )}
      {officers.success && (
        <Alert variant="success" className="p-2">
          {officers.success}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الرقم العسكري</th>
              <th>الرتبة</th>
              <th>الإسم</th>
              <th>الورشة / الفرع</th>
              <th>تاريخ الضم</th>
              <th>التمام</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((officer) => (
              <tr key={officer.mil_id}>
                <td>{officer.mil_id}</td>
                <td>{officer.rank}</td>
                <td>{officer.name}</td>
                <td>{officer.department}</td>
                <td>{moment(officer.join_date).format('YYYY-MM-DD')}</td>
                <td>{officer.in_unit ? 'متواجد' : 'غير موجود'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(officer)}
                    >
                      حذف
                    </button>
                    <Link to={`${officer.id}`} className="btn btn-sm btn-primary">
                      تعديل
                    </Link>
                    <Link to={`details/${officer.id}`} className="btn btn-sm btn-primary">
                      تفاصيل
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <button
          className="btn btn-light"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`btn btn-light page-btn ${
              currentPage === number ? 'active' : ''
            }`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="btn btn-light"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
          {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          هل أنت متأكد أنك تريد حذف الضابط <strong>{selectedOfficer?.name}</strong>؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            حذف
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Officers;
