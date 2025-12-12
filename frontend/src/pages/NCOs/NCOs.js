import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const NCOs = () => {
  const auth = getAuthUser();
  const [ncos, setNCOs] = useState({
    loading: true,
    err: null,
    success: null,
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedNCO, setSelectedNCO] = useState(null);

  // Additional fields for the delete operation
  const [endDate, setEndDate] = useState('');
  const [transferID, setTransferID] = useState('');
  const [transferredTo, setTransferredTo] = useState('');

  useEffect(() => {
    setNCOs({ ...ncos, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/nco/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setNCOs({
          ...ncos,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setNCOs({
          ...ncos,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
  }, [ncos.reload]);

  // Show confirmation modal before deleting
  const handleDeleteClick = (nco) => {
    setSelectedNCO(nco);
    setShowConfirm(true);
  };

  // Handle form data changes for delete modal
  const handleEndDateChange = (e) => setEndDate(e.target.value);
  const handleTransferIDChange = (e) => setTransferID(e.target.value);
  const handleTransferredToChange = (e) => setTransferredTo(e.target.value);

  // Delete confirmation with additional fields
  const confirmDelete = () => {
    if (!selectedNCO) return;

    // Prepare data to be sent for archiving the NCO
    const data = {
      end_date: endDate,
      transferID: transferID,
      transferred_to: transferredTo,
    };

    // Send DELETE request with additional fields
    axios
      .delete(`${process.env.REACT_APP_BACKEND_BASE_URL}/nco/` + selectedNCO.mil_id, {
        headers: {
          token: auth.token,
        },
        data: data, // Send additional fields in the body of the DELETE request
      })
      .then(() => {
        setShowConfirm(false);
        setSelectedNCO(null);
        setEndDate('');
        setTransferID('');
        setTransferredTo('');

        // Show success message
        setNCOs({
          ...ncos,
          reload: ncos.reload + 1,
          success: 'تم حذف ضابط الصف بنجاح ✅',
          err: null,
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setNCOs((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setNCOs({
          ...ncos,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة حذف ضابط الصف.',
        });
        setShowConfirm(false);
      });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = ncos.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(ncos.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة ضباط الصف</h3>
        <Link to={'../add'} className="btn btn-success mb-4">
          إنشاء ضابط صف جديد +
        </Link>
      </div>

      {ncos.success && (
        <Alert variant="success" className="p-2 text-center">
          {ncos.success}
        </Alert>
      )}

      {ncos.err && (
        <Alert variant="danger" className="p-2 text-center">
          {ncos.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الرقم العسكري</th>
              <th>الدرجة</th>
              <th>الإسم</th>
              <th>الورشة / الفرع</th>
              <th>تاريخ الضم</th>
              <th>ملحق؟</th>
              <th>التمام</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((nco) => (
              <tr key={nco.mil_id}>
                <td>{nco.mil_id}</td>
                <td>{nco.rank}</td>
                <td>{nco.name}</td>
                <td>{nco.department}</td>
                <td>{moment(nco.join_date).format('YYYY-MM-DD')}</td>
                <td>{nco.attached ? 'نعم' : 'لا'}</td>
                <td>{nco.in_unit ? 'متواجد' : 'غير موجود'}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(nco)}
                    >
                      حذف
                    </button>
                    <Link
                      to={`../${nco.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`../details/${nco.id}`}
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

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          هل أنت متأكد أنك تريد حذف ضابط الصف{' '}
          <strong>{selectedNCO?.name}</strong>؟

          {/* Additional Fields */}
          <Form>
            <Form.Group controlId="endDate">
              <Form.Label>تاريخ النقل</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </Form.Group>

            <Form.Group controlId="transferID">
              <Form.Label>رقم بند أوامر النقل</Form.Label>
              <Form.Control
                type="text"
                value={transferID}
                onChange={handleTransferIDChange}
              />
            </Form.Group>

            <Form.Group controlId="transferredTo">
              <Form.Label>تم النقل إلى</Form.Label>
              <Form.Control
                type="text"
                value={transferredTo}
                onChange={handleTransferredToChange}
              />
            </Form.Group>
          </Form>
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

export default NCOs;
