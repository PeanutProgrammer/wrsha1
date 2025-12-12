import React, { useState, useEffect } from 'react';
import "../../style/style.css";
import { Table, Alert, Button, InputGroup, Form } from "react-bootstrap";
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const now = moment().format("YYYY-MM-DD HH:mm:ss");

const ExpertsLog = () => {
  const auth = getAuthUser()
  let {id} = useParams();
  const [experts, setExperts] = useState({
    loading: true,
    err: null,
    results: [],
    page: 1,
    totalPages: 1,
    search: "",
    tempSearch: "",
  });

    const fetchExperts = async () => {
      setExperts((prev) => ({ ...prev, loading: true, results: [] }));
      try {
        const searchValue = toWesternDigits(experts.search.trim());
        const resp = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/ExpertLog?page=${experts.page}&limit=20&search=${searchValue}`,
          { headers: { token: auth.token } }
        );
        setExperts((prev) => ({
          ...prev,
          results: resp.data.data || [],
          totalPages: resp.data.totalPages || 1,
          loading: false,
          err: null,
        }));
      } catch (err) {
        setExperts((prev) => ({
          ...prev,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "حدث خطأ أثناء تحميل البيانات.",
        }));
      }
    };

  useEffect(() => {
    fetchExperts();
  }, [experts.page, experts.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(experts.tempSearch.trim());
    setExperts((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

    const handleClearSearch = () => {
      setExperts((prev) => ({
        ...prev,
        search: "",
        tempSearch: "",
        page: 1,
        results: [],
      }));
    };
  
    const handlePrevPage = () => {
      if (experts.page > 1)
        setExperts((prev) => ({ ...prev, page: prev.page - 1 }));
    };

    const handleNextPage = () => {
      if (experts.page < experts.totalPages)
        setExperts((prev) => ({ ...prev, page: prev.page + 1 }));
    };

    const handleJumpToPage = (number) => {
      if (number >= 1 && number <= experts.totalPages) {
        setExperts((prev) => ({ ...prev, page: number }));
      }
    };

    const renderPageButtons = () => {
      const pages = [];
      const maxButtons = 5;
      let start = Math.max(experts.page - 2, 1);
      let end = Math.min(start + maxButtons - 1, experts.totalPages);
      start = Math.max(end - maxButtons + 1, 1);

      for (let num = start; num <= end; num++) {
        pages.push(
          <Button
            key={num}
            onClick={() => handleJumpToPage(num)}
            variant={num === experts.page ? "primary" : "outline-primary"}
            className="mx-1 btn-sm"
          >
            {num}
          </Button>
        );
      }
      return pages;
    };

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3 align-items-center">
        <h3 className="text-center mb-3">إدارة تمام الخبراء</h3>
        <Form onSubmit={handleSearchSubmit}>
          <InputGroup style={{ width: "220px" }}>
            <Form.Control
              size="sm"
              placeholder="بحث"
              value={experts.tempSearch}
              onChange={(e) =>
                setExperts((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
              }
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleSearchSubmit}
              className="p-1"
            >
              🔍
            </Button>
            {experts.tempSearch && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={handleClearSearch}
                className="p-1"
              >
                ×
              </Button>
            )}
          </InputGroup>
        </Form>
      </div>

      {experts.err && (
        <Alert variant="danger" className="p-2">
          {experts.err}
        </Alert>
      )}
      {experts.success && (
        <Alert variant="success" className="p-2">
          {experts.success}
        </Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>رقم تحقيق الشخصية</th>
            <th>الإسم</th>
            <th>رقم التصديق الأمني</th>
            <th>اسم الشركة</th>
            <th>حالة التصديق</th>
            <th>وقت الدخول</th>
            <th>وقت الخروج</th>
            <th>الفرع / الورشة</th>
            <th>الضابط المرافق</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {experts.results.map((expert) => (
            <tr key={expert.nationalID}>
              <td>{expert.nationalID}</td>
              <td>{expert.name}</td>
              <td>{expert.security_clearance_number}</td>
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

              <td>
                {expert.start_date
                  ? new Date(expert.start_date).toLocaleString("ar-EG", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "لا يوجد"}
              </td>

              <td>
                {expert.end_date
                  ? new Date(expert.end_date).toLocaleString("ar-EG", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "لا يوجد"}
              </td>

              <td>{expert.department ? expert.department : "لا يوجد"}</td>

              <td>
                {expert.officerName
                  ? `${expert.rank} / ${expert.officerName}`
                  : expert.external_officer}
              </td>
              <td>{expert.notes ? expert.notes : "لا يوجد"}</td>

              {/* <td >{officer.tmam? officer.tmam: "متواجد"}</td> */}
            </tr>
          ))}
        </tbody>
      </Table>

       <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                onClick={handlePrevPage}
                disabled={experts.page === 1}
                variant="secondary"
                size="sm"
              >
                السابق
              </Button>
              <div>{renderPageButtons()}</div>
              <Button
                onClick={handleNextPage}
                disabled={experts.page === experts.totalPages}
                variant="secondary"
                size="sm"
              >
                التالي
              </Button>
            </div>
    </div>
  );
};

export default ExpertsLog;


