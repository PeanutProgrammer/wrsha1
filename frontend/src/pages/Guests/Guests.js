import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};
const Guests = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [guests, setGuests] = useState({
    loading: true,
    err: null,
    success: null, // ✅ Added success message
    results: [],
    reload: 0,
    page: 1,
    totalPages: 1,
    limit: 15,
    search: "",
    tempSearch: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  // ✅ Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    const fetchData = () => {
      const searchValue = toWesternDigits(guests.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/guest?page=${guests.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setGuests({
            ...guests,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setGuests({
            ...guests,
            loading: false,
            err: err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
          });
        });
    };

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("expertsUpdated", () => {
      console.log("📢 Guests updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [guests.page, guests.search]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (guest) => {
    setSelectedGuest(guest);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedGuest) return;

    axios
      .delete(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/guest/` +
          selectedGuest.nationalID,
        {
          headers: {
            token: auth.token,
          },
        }
      )
      .then(() => {
        setShowConfirm(false);
        setSelectedGuest(null);

        // ✅ Show success message
        setGuests({
          ...guests,
          reload: guests.reload + 1,
          success: "تم حذف الخبير بنجاح ✅",
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setGuests((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setGuests({
          ...guests,
          err: err.response?.data?.errors || "حدث خطأ أثناء محاولة حذف الخبير.",
        });
        setShowConfirm(false);
      });
  };

    // ✅ Function to end the visit (update visit_end)
  const endVisit = (guestId) => {
    const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss");  // Current time

    axios
      .put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/guest/end-visit/${guestId}`,
        { visit_end: visitEnd },
        {
          headers: {
            token: auth.token,
          },
        }
      )
      .then((response) => {
        // Refresh the guest data after updating
        setGuests({
          ...Guests,
          reload: Guests.reload + 1,
          success: "تم إنهاء الزيارة بنجاح ✅",
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setGuests((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setGuests({
          ...Guests,
          err:
            err.response?.data?.errors || "حدث خطأ أثناء محاولة إنهاء الزيارة.",
        });
      });
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(guests.tempSearch.trim());
    setGuests((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setGuests((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (guests.page > 1)
      setGuests((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (guests.page < guests.totalPages)
      setGuests((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= guests.totalPages) {
      setGuests((prev) => ({ ...prev, page: number }));
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(guests.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, guests.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === guests.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedGuests = [...guests.results].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting yet
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة الزوار</h3>
        <Link to={'../add'} className="btn btn-success mb-4">
          إنشاء زائر جديد +
        </Link>

      </div>

      {/* ✅ Success Message */}
      {guests.success && (
        <Alert variant="success" className="p-2 text-center">
          {guests.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {guests.err && (
        <Alert variant="danger" className="p-2 text-center">
          {guests.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover responsive className="mb-0">
          <thead className='table-dark'>
            <tr>
              <th>م</th>
              <th>الإسم</th>
              <th>زيارة إلى</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>سبب الزيارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(guests.results) && guests.results.length > 0 ? (
              sortedGuests.map((guest, index) => (
              <tr key={guest.id}>
                  <td>{(guests.page - 1) * guests.limit + index + 1}</td>
                <td>{guest.name}</td>
                <td>{guest.rank + " " + guest.officer_name}</td>
                <td>{moment(guest.visit_start).format('YYYY-MM-DD HH:mm')}</td>
                {/* Conditionally show visit_end */}
                <td>{guest.visit_end ? moment(guest.visit_end).format('YYYY-MM-DD HH:mm') : 'لا يوجد'}</td>
                <td>{guest.reason ? guest.reason : "لا يوجد"}</td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(guest)}
                    >
                      حذف
                    </button>


                    {/* Add End Visit button */}
                    {!guest.visit_end && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => endVisit(guest.id)}
                      >
                        إنهاء الزيارة
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

     {/* Pagination Controls */}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={guests.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={guests.page === guests.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>

      {/* ✅ Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          هل أنت متأكد أنك تريد حذف الخبير{" "}
          <strong>{selectedGuest?.name}</strong>؟
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
 

      {/* ✅ Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          هل أنت متأكد أنك تريد حذف الزائر{' '}
          <strong>{selectedGuest?.name}</strong>؟
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

export default Guests;
