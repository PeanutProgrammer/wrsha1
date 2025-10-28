import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const Guests = () => {
  const auth = getAuthUser();
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  const [Guests, setGuests] = useState({
    loading: true,
    err: null,
    success: null, // ✅ Added success message
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  // ✅ Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    setGuests({ ...Guests, loading: true });
    axios
      .get('http://localhost:4001/guest/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setGuests({
          ...Guests,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setGuests({
          ...Guests,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Guests.reload]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (guest) => {
    setSelectedGuest(guest);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedGuest) return;

    axios
      .delete('http://localhost:4001/guest/' + selectedGuest.id, {
        headers: {
          token: auth.token,
        },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedGuest(null);

        // ✅ Show success message
        setGuests({
          ...Guests,
          reload: Guests.reload + 1,
          success: 'تم حذف الزائر بنجاح ✅',
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
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة حذف الزائر.',
        });
        setShowConfirm(false);
      });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = Guests.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(Guests.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة الزوار</h3>
        <Link to={'AddGuests'} className="btn btn-success mb-4">
          إنشاء زائر جديد +
        </Link>
      </div>

      {/* ✅ Success Message */}
      {Guests.success && (
        <Alert variant="success" className="p-2 text-center">
          {Guests.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {Guests.err && (
        <Alert variant="danger" className="p-2 text-center">
          {Guests.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>              
              <th>الإسم</th>
              <th>زيارة إلى</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>سبب الزيارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((guest) => (
              <tr key={guest.id}>
                <td>{guest.id}</td>
                <td>{guest.name}</td>
                <td>{guest.rank + " " +guest.officer_name}</td>
                <td>{moment(guest.visit_start).format('YYYY-MM-DD HH:mm')}</td>
                <td>{moment(guest.visit_end).format('YYYY-MM-DD HH:mm')}</td>
                <td>{guest.reason ? guest.reason : "لا يوجد"}</td>

                
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(guest)}
                    >
                      حذف
                    </button>
                    <Link
                      to={`${guest.nationalID}`}
                      className="btn btn-sm btn-primary"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`details/${guest.nationalID}`}
                      className="btn btn-sm btn-primary"
                    >
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
          السابق
        </button>

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
          التالي
        </button>
      </div>

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
