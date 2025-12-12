import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const DelegateDeparture = () => {
  const auth = getAuthUser();
  const [delegates, setDelegates] = useState({
    loading: true,
    err: null,
    success: null,
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);

  const [noDelegatesMessage, setNoDelegatesMessage] = useState(''); // State for "No delegates found" message

  useEffect(() => {
    setDelegates({ ...delegates, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/delegate/current`, {
        headers: { token: auth.token },
      })
      .then((resp) => {
        if (resp.data.msg === 'No delegates with null visit_end found') {
          setNoDelegatesMessage('لا يوجد مناديب حالياً.');  // Set the "No delegates found" message
        } else {
          setDelegates({
            ...delegates,
            results: resp.data,
            loading: false,
            err: null,
          });
          setNoDelegatesMessage('');  // Clear any previous "No delegates" message
        }
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data.msg) {
          if (err.response.data.msg === 'No delegates with null visit_end found') {
            setNoDelegatesMessage('لا يوجد مناديب حالياً.'); // Display the "No delegates found" message
          } else {
            setDelegates({
              ...delegates,
              loading: false,
              err: err.response.data.msg || 'حدث خطأ أثناء تحميل البيانات.',
            });
          }
        } else {
          setDelegates({
            ...delegates,
            loading: false,
            err: 'حدث خطأ أثناء تحميل البيانات.',
          });
        }
      });
  }, [delegates.reload]);

  const endVisit = (delegateId) => {
    const visitEnd = moment().format("YYYY-MM-DD HH:mm:ss"); // Current time

    axios
      .put(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/delegate/end-visit/${delegateId}`,
        { visit_end: visitEnd },
        {
          headers: {
            token: auth.token,
          },
        }
      )
      .then((response) => {
        setDelegates({
          ...delegates,
          reload: delegates.reload + 1,
          success: "تم إنهاء الزيارة بنجاح ✅",
          err: null,
        });

        // Hide success message after 3 seconds
        setTimeout(() => {
          setDelegates((prev) => ({ ...prev, success: null }));
        }, 3000);

        // Remove delegate from the table after 5 seconds
        setTimeout(() => {
          setDelegates((prev) => ({
            ...prev,
            results: prev.results.filter(
              (delegate) => delegate.id !== delegateId
            ),
          }));
        }, 5000);
      })
      .catch((err) => {
        setDelegates({
          ...delegates,
          err:
            err.response?.data?.errors || "حدث خطأ أثناء محاولة إنهاء الزيارة.",
        });
      });
  };
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = delegates.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(delegates.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">المناديب المتواجدين</h3>
      </div>

      {/* Success Message */}
      {delegates.success && (
        <Alert variant="success" className="p-2 text-center">
          {delegates.success}
        </Alert>
      )}

      {/* Error Message */}
      {delegates.err && (
        <Alert variant="danger" className="p-2 text-center">
          {delegates.err}
        </Alert>
      )}

      {/* "No delegates found" message */}
      {noDelegatesMessage && (
        <Alert variant="info" className="p-2 text-center">
          {noDelegatesMessage}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              {/* <th>#</th> */}
              <th>الرتبة / الدرجة</th>
              <th>الاسم</th>
              <th>اسم الوحدة</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>سبب الزيارة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((delegate) => (
              <tr key={delegate.id}>
                {/* <td>{delegate.id}</td> */}
                <td>{delegate.rank}</td>
                <td>{delegate.name}</td>
                <td>{delegate.unit}</td>
                <td>{moment(delegate.visit_start).format('YYYY-MM-DD HH:mm')}</td>
                <td>
                  {/* Show the updated end time */}
                  {delegate.visit_end ? moment(delegate.visit_end).format('YYYY-MM-DD HH:mm') : 'لا يوجد'}
                </td>
                <td>{delegate.notes ? delegate.notes : "لا يوجد"}</td>
                <td>
                  <div className="action-buttons">
                    {!delegate.visit_end && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => endVisit(delegate.id)}
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
          التالي
        </button>
      </div>
    </div>
  );
};

export default DelegateDeparture;
