import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const Experts = () => {
  const auth = getAuthUser();
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  const [experts, setExperts] = useState({
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
  const [selectedExpert, setSelectedExpert] = useState(null);

  useEffect(() => {
    setExperts({ ...experts, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/expert/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setExperts({
          ...experts,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setExperts({
          ...experts,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experts.reload]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (expert) => {
    setSelectedExpert(expert);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedExpert) return;

    axios
      .delete(`${process.env.REACT_APP_BACKEND_BASE_URL}/expert/` + selectedExpert.nationalID, {
        headers: {
          token: auth.token,
        },
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedExpert(null);

        // ✅ Show success message
        setExperts({
          ...experts,
          reload: experts.reload + 1,
          success: 'تم حذف الخبير بنجاح ✅',
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setExperts((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setExperts({
          ...experts,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة حذف الخبير.',
        });
        setShowConfirm(false);
      });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = experts.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(experts.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة الخبراء</h3>
        <Link to={"../add"} className="btn btn-success mb-4">
          إنشاء خبير جديد +
        </Link>
      </div>

      {/* ✅ Success Message */}
      {experts.success && (
        <Alert variant="success" className="p-2 text-center">
          {experts.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {experts.err && (
        <Alert variant="danger" className="p-2 text-center">
          {experts.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الرقم القومي</th>
              <th>جواز السفر</th>
              <th>الإسم</th>
              <th>رقم التصديق الأمني</th>
              <th>الفترة من</th>
              <th>الفترة إلى</th>
              <th>الفرع / الورشة</th>
              <th>اسم الشركة</th>
              <th>حالة التصديق</th>
              <th>التمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((expert) => (
              <tr key={expert.nationalID}>
                <td>{expert.nationalID}</td>
                <td>{expert.passport_number}</td>
                <td>{expert.name}</td>
                <td>{expert.security_clearance_number}</td>
                <td>{moment(expert.valid_from).format("YYYY-MM-DD")}</td>
                <td>{moment(expert.valid_through).format("YYYY-MM-DD")}</td>
                <td>{expert.department}</td>
                <td>{expert.company_name}</td>

                <td
                  className={
                    moment(expert.valid_from).isBefore(now) &&
                    moment(expert.valid_through).isAfter(now)
                      ? "bg-success text-white" // Valid: green
                      : moment(expert.valid_through).isBefore(now)
                      ? "bg-danger text-white" // Expired: red
                      : moment(expert.valid_from).isAfter(now)
                      ? "bg-warning text-dark" // Not started yet: yellow
                      : "bg-danger text-white" // fallback
                  }
                >
                  {" "}
                  {
                    moment(expert.valid_from).isBefore(now) &&
                    moment(expert.valid_through).isAfter(now)
                      ? "ساري"
                      : moment(expert.valid_through).isBefore(now)
                      ? "منتهي"
                      : moment(expert.valid_from).isAfter(now)
                      ? "لم يبدأ بعد" // Optional, if you want to display something for experts who haven't started yet
                      : "منتهي" // fallback for invalid state
                  }
                </td>
                <td
                  className={
                    expert.in_unit
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }
                >
                  {expert.in_unit ? "متواجد" : "غير موجود"}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(expert)}
                    >
                      حذف
                    </button>
                    <Link
                      to={`../${expert.nationalID}`}
                      className="btn btn-sm btn-primary"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`../details/${expert.nationalID}`}
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
          هل أنت متأكد أنك تريد حذف الخبير{" "}
          <strong>{selectedExpert?.name}</strong>؟
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

export default Experts;
