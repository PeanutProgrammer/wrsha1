import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";

const PastOfficers = () => {
  const auth = getAuthUser();
  const [officers, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(10); // Number of records per page



  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // your backend port

    // 🔁 Initial fetch
    const fetchData = () => {
      axios
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/pastOfficer/`, {
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
      console.log("📢 PastOfficers updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, []);


  // Show confirmation modal before deleting
 
  // Handle form data changes


  // Confirm deletion
 
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
        <h3 className="text-center mb-3">إدارة الضباط السابقين</h3>

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
        <Table striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>الرقم العسكري</th>
              <th>الرتبة</th>
              <th>الإسم</th>
              <th>تاريخ الضم</th>
              <th>تاريخ النقل</th>
              <th>النقل إلى</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((officer) => (
              <tr key={officer.mil_id}>
                <td>{officer.mil_id}</td>
                <td>{officer.rank}</td>
                <td>{officer.name}</td>
                <td>{moment(officer.join_date).format('YYYY-MM-DD')}</td>
                <td>{moment(officer.end_date).format('YYYY-MM-DD')}</td>
                <td>{officer.transferred_to}</td>
                <td>
                  <div className="action-buttons">
                    {/* <Link to={`${officer.id}`} className="btn btn-sm btn-primary">
                      تعديل
                    </Link> */}
                    <Link to={`${officer.id}`} className="btn btn-sm btn-primary">
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
            className={`btn btn-light page-btn ${currentPage === number ? 'active' : ''}`}
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

      {/* Confirmation Modal for Deleting Officer */}
   
    </div>
  );
};

export default PastOfficers;
