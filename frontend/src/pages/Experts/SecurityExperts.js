import React, { useState, useEffect } from "react";
import { Table, Alert, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";

const SecurityExperts = () => {
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


  useEffect(() => {
    setExperts({ ...experts, loading: true });
    axios
      .get("http://192.168.1.3:4001/expert/", {
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
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "حدث خطأ أثناء تحميل البيانات.",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experts.reload]);

  // ✅ Show confirmation modal before deleting
 

  // ✅ Delete confirmation
 

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
              <th>حالة التصديق</th>
              <th>التمام</th>
              <th>اسم الشركة</th>
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
                                <td>{expert.company_name}</td>

                                <td>
                                  <div className="action-buttons">
                                   
                                    <Link
                                      to={`../experts/details/${expert.nationalID}`}
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

     
    </div>
  );
};

export default SecurityExperts;
