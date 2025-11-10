import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const ExpertDeparture = () => {
  const auth = getAuthUser();
  const [Experts, setExperts] = useState({
    loading: true,
    err: null,
    success: null,
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  useEffect(() => {
    setExperts({ ...Experts, loading: true });
    axios
      .get('http://localhost:4001/expertLog/current', {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setExperts({
          ...Experts,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setExperts({
          ...Experts,
          loading: false,
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ أثناء تحميل البيانات.',
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Experts.reload]);

  // Function to end the visit (update visit_end for expert)
  const endVisit = (expertId) => {
    const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss"); // Current time

    axios
      .put(`http://localhost:4001/expertLog/end-visit/${expertId}`, { visit_end: visitEnd }, {
        headers: {
          token: auth.token,
        },
      })
      .then((response) => {
        setExperts({
          ...Experts,
          reload: Experts.reload + 1,
          success: 'تم إنهاء الزيارة بنجاح ✅',
          err: null,
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setExperts((prev) => ({ ...prev, success: null }));
        }, 3000);

        // Remove expert from the table after 5 seconds
        setTimeout(() => {
          setExperts((prev) => ({
            ...prev,
            results: prev.results.filter((expert) => expert.id !== expertId),
          }));
        }, 5000);
      })
      .catch((err) => {
        setExperts({
          ...Experts,
          err:
            err.response?.data?.errors ||
            'حدث خطأ أثناء محاولة إنهاء الزيارة.',
        });
      });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = Experts.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(Experts.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">الخبراء المتواجدين</h3>
      </div>

      {/* Success Message */}
      {Experts.success && (
        <Alert variant="success" className="p-2 text-center">
          {Experts.success}
        </Alert>
      )}

      {/* Error Message */}
      {Experts.err && (
        <Alert variant="danger" className="p-2 text-center">
          {Experts.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>الرقم القومي</th>
              <th>الإسم</th>
              <th>رقم التصريح الأمني</th>
              <th>اسم الشركة</th>
              <th>الورشة / الفرع</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((expert) => (
              <tr key={expert.nationalID}>
                <td>{expert.nationalID}</td>
                <td>{expert.name}</td>
                <td>{expert.security_clearance_number}</td>
                <td>{expert.company_name}</td>
                <td>{expert.department_visited}</td>
                <td>{moment(expert.start_date).format('YYYY-MM-DD HH:mm')}</td>
                <td>{expert.end_date ? moment(expert.end_date).format('YYYY-MM-DD HH:mm') : 'لا يوجد'}</td>

                <td>
                  <div className="action-buttons">
                    {/* End Visit button */}
                    {!expert.end_date && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => endVisit(expert.id)}
                      >
                        إنهاء الزيارة
                      </button>
                    )}
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
    </div>
  );
};

export default ExpertDeparture;
