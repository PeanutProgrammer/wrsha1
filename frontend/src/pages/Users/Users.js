import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";

const Users = () => {
  const auth = getAuthUser();
  const [users, setUsers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [recordsPerPage] = useState(10); // Number of records per page
  const [showConfirm, setShowConfirm] = useState(false);  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);  // Selected officer for deletion



  useEffect(() => {
    const socket = io("http://192.168.1.3:4001"); //  backend port

    // 🔁 Initial fetch
    const fetchData = () => {
      axios
        .get("http://192.168.1.3:4001/user/", {
          headers: { token: auth.token },
        })
        .then((resp) => {
          setUsers({
            ...users,
            results: resp.data,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setUsers({
            ...users,
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
      console.log("📢 Users updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, []);


  // Show confirmation modal before deleting
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowConfirm(true);
  };



  // Confirm deletion
  const confirmDelete = () => {
    if (!selectedUser) return;



    // Change the API method to DELETE as per the new backend implementation
    axios
      .delete('http://192.168.1.3:4001/user/' + selectedUser.id, {
        headers: { token: auth.token },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedUser(null);
        // Directly update the users state to reflect the deletion
        setUsers((prevState) => {
          const updatedUsers = prevState.results.filter(
            (user) => user.id !== selectedUser.id
          );
          return { ...prevState, results: updatedUsers, success: 'تم حذف المستخدم بنجاح ✅' };
        });
      })
      .catch((err) => {
        setUsers({
          ...users,
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
  const currentRecords = users.results.slice(indexOfFirstRecord, indexOfLastRecord);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(users.results.length / recordsPerPage);

  // Generate an array of page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة المستخدمين</h3>
        <Link to={"add"} className="btn btn-success mb-4">
          إنشاء مستخدم جديد +
        </Link>
      </div>

      {users.err && (
        <Alert variant="danger" className="p-2">
          {users.err}
        </Alert>
      )}
      {users.success && (
        <Alert variant="success" className="p-2">
          {users.success}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>الاسم</th>
              <th>Username</th>
              <th>نوع المستخدم</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.username}</td>
                <td>{user.type}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(user)}
                    >
                      حذف
                    </button>
                    <Link to={`${user.id}`} className="btn btn-sm btn-primary">
                      تعديل
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
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>هل أنت متأكد أنك تريد حذف المستخدم <strong>{selectedUser?.name}</strong>؟</p>

          </div>
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

export default Users;
