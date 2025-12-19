import React, { useState, useEffect } from "react";
import { Table, Alert, Modal, Button } from "react-bootstrap";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";

const SecurityDelegates = () => {
  const auth = getAuthUser();
  const [Delegates, setDelegates] = useState({
    loading: true,
    err: null,
    success: null, // ✅ Added success message
    results: [],
    reload: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);



  useEffect(() => {
    setDelegates({ ...Delegates, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/delegate/`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setDelegates({
          ...Delegates,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setDelegates({
          ...Delegates,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "حدث خطأ أثناء تحميل البيانات.",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Delegates.reload]);



 

 

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = Delegates.results.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const totalPages = Math.ceil(Delegates.results.length / recordsPerPage);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة المناديب</h3>

      </div>

      {/* ✅ Success Message */}
      {Delegates.success && (
        <Alert variant="success" className="p-2 text-center">
          {Delegates.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {Delegates.err && (
        <Alert variant="danger" className="p-2 text-center">
          {Delegates.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th>الرتبة / الدرجة</th>
              <th>الاسم</th>
              <th>اسم الوحدة</th>
              <th>وقت الدخول</th>
              <th>وقت الخروج</th>
              <th>سبب الزيارة</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((delegate, index) => (
              <tr key={delegate.id}>
                <td>{index+1}</td>
                <td>{delegate.rank}</td>
                <td>{delegate.name}</td>
                <td>{delegate.unit}</td>
                <td>{moment(delegate.visit_start).format("YYYY-MM-DD HH:mm")}</td>
                {/* Conditionally show visit_end */}
                <td>
                  {delegate.visit_end
                    ? moment(delegate.visit_end).format("YYYY-MM-DD HH:mm")
                    : "لا يوجد"}
                </td>
                <td>{delegate.notes ? delegate.notes : "لا يوجد"}</td>

                
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

      
    </div>
  );
};

export default SecurityDelegates;
