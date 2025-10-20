import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const Civillians = () => {
  const auth = getAuthUser();
  const [civillians, setCivillians] = useState({
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
  const [selectedCivillian, setSelectedCivillian] = useState(null);

  useEffect(() => {
    setCivillians({ ...civillians, loading: true });
    axios
      .get('http://localhost:4001/civillian/', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setCivillians({
          ...civillians,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setCivillians({
          ...civillians,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [civillians.reload]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (civillian) => {
    setSelectedCivillian(civillian);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedCivillian) return;

    axios
      .delete('http://localhost:4001/civillian/' + selectedCivillian.mil_id, {
        headers: {
          token: auth.token,
        },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedCivillian(null);

        // ✅ Show success message
        setCivillians({
          ...civillians,
          reload: civillians.reload + 1,
          success: 'تم حذف المدني بنجاح ✅',
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setCivillians((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setCivillians({
          ...civillians,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة حذف المدني.',
        });
        setShowConfirm(false);
      });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = civillians.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(civillians.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة المدنيين</h3>
        <Link to={'Addcivillians'} className="btn btn-success mb-4">
          إنشاء مدني جديد +
        </Link>
      </div>

      {/* ✅ Success Message */}
      {civillians.success && (
        <Alert variant="success" className="p-2 text-center">
          {civillians.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {civillians.err && (
        <Alert variant="danger" className="p-2 text-center">
          {civillians.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الرقم القومي</th>
              <th>الإسم</th>
              <th>الورشة / الفرع</th>
              <th>تاريخ الضم</th>
              <th>التمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((civillian) => (
              <tr key={civillian.nationalID}>
                <td>{civillian.nationalID}</td>
                <td>{civillian.name}</td>
                <td>{civillian.department}</td>
                <td>{moment(civillian.join_date).format('YYYY-MM-DD')}</td>
                <td>{civillian.in_unit ? 'متواجد' : 'غير موجود'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(civillian)}
                    >
                      حذف
                    </button>
                    <Link
                      to={`${civillian.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`details/${civillian.id}`}
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
          هل أنت متأكد أنك تريد حذف المدني{' '}
          <strong>{selectedCivillian?.name}</strong>؟
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

export default Civillians;
