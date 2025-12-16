import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const Soldiers = () => {
  const auth = getAuthUser();
  const [soldiers, setSoldiers] = useState({
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
  const [selectedSoldier, setSelectedSoldier] = useState(null);

  useEffect(() => {
    setSoldiers({ ...soldiers, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setSoldiers({
          ...soldiers,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setSoldiers({
          ...soldiers,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldiers.reload]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (soldier) => {
    setSelectedSoldier(soldier);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedSoldier) return;

    axios
      .delete(`${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/` + selectedSoldier.mil_id, {
        headers: {
          token: auth.token,
        },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedSoldier(null);

        // ✅ Show success message
        setSoldiers({
          ...soldiers,
          reload: soldiers.reload + 1,
          success: 'تم حذف الجندي بنجاح ✅',
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setSoldiers((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setSoldiers({
          ...soldiers,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة حذف الجندي.',
        });
        setShowConfirm(false);
      });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = soldiers.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(soldiers.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة الجنود</h3>
        <Link to={"../add"} className="btn btn-success mb-4">
          إنشاء جندي جديد +
        </Link>
      </div>

      {/* ✅ Success Message */}
      {soldiers.success && (
        <Alert variant="success" className="p-2 text-center">
          {soldiers.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {soldiers.err && (
        <Alert variant="danger" className="p-2 text-center">
          {soldiers.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>م</th>
              <th>الرقم العسكري</th>
              <th>الدرجة</th>
              <th>الاسم</th>
              <th>الورشة / الفرع</th>
              <th>تاريخ الضم</th>
              <th>تاريخ التسريح</th>
              <th>ملحق؟</th>
              <th>التمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((soldier, index) => (
              <tr key={soldier.mil_id}>
                <td>{index + 1}</td> {/* Arabic numbering, starting from 1 */}
                <td>{soldier.mil_id}</td>
                <td>{soldier.rank}</td>
                <td>{soldier.name}</td>
                <td>{soldier.department}</td>
                <td>{moment(soldier.join_date).format("YYYY-MM-DD")}</td>
                <td>{moment(soldier.end_date).format("YYYY-MM-DD")}</td>
                <td>{soldier.attached ? "نعم" : "لا"}</td>
                <td>{soldier.in_unit ? "متواجد" : "غير موجود"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(soldier)}
                    >
                      حذف
                    </button>
                    <Link
                      to={`../${soldier.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`../details/${soldier.id}`}
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
              currentPage === number ? "active" : ""
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
          هل أنت متأكد أنك تريد حذف الجندي{" "}
          <strong>{selectedSoldier?.name}</strong>؟
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

export default Soldiers;
