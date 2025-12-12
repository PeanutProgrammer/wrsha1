import React, { useState, useEffect } from "react";
import "../../style/style.css";
import { Table, Alert, Button, InputGroup, Form } from "react-bootstrap";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const CivilliansLog = () => {
  const auth = getAuthUser();

  const [civillians, setCivillians] = useState({
    loading: true,
    err: null,
    results: [],
    page: 1,
    totalPages: 1,
    search: "",
    tempSearch: "",
  });

  const fetchCivillians = async () => {
    setCivillians((prev) => ({ ...prev, loading: true, results: [] }));
    try {
      const searchValue = toWesternDigits(civillians.search.trim());
      const resp = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/CivillianLog?page=${civillians.page}&limit=20&search=${searchValue}`,
        { headers: { token: auth.token } }
      );
      setCivillians((prev) => ({
        ...prev,
        results: resp.data.data || [],
        totalPages: resp.data.totalPages || 1,
        loading: false,
        err: null,
      }));
    } catch (err) {
      setCivillians((prev) => ({
        ...prev,
        loading: false,
        err: err.response
          ? JSON.stringify(err.response.data.errors)
          : "حدث خطأ أثناء تحميل البيانات.",
      }));
    }
  };

  useEffect(() => {
    fetchCivillians();
  }, [civillians.page, civillians.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(civillians.tempSearch.trim());
    setCivillians((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setCivillians((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (civillians.page > 1)
      setCivillians((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (civillians.page < civillians.totalPages)
      setCivillians((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= civillians.totalPages) {
      setCivillians((prev) => ({ ...prev, page: number }));
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(civillians.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, civillians.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === civillians.page ? "primary" : "outline-primary"}
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
        <h3 className="text-center mb-3">إدارة تمام المدنيين</h3>
        <Form onSubmit={handleSearchSubmit}>
          <InputGroup style={{ width: "220px" }}>
            <Form.Control
              size="sm"
              placeholder="بحث"
              value={civillians.tempSearch}
              onChange={(e) =>
                setCivillians((prev) => ({
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
            {civillians.tempSearch && (
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

      {civillians.err && <Alert variant="danger">{civillians.err}</Alert>}

      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>الرقم القومي</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>دخول / خروج</th>
            <th>الوقت</th>
            <th>السبب</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(civillians.results) &&
          civillians.results.length > 0 ? (
            civillians.results.map((civillian) => (
              <tr key={civillian.nationalID}>
                <td>{civillian.nationalID}</td>
                <td>{civillian.name}</td>
                <td>{civillian.department}</td>
                <td>{civillian.event_type || "لا يوجد"}</td>
                <td>
                  {civillian.event_time
                    ? new Date(civillian.event_time).toLocaleString("ar-EG", {
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
                  {civillian.event_type
                    ? civillian.event_type == "دخول"
                      ? `عودة ${civillian.reason || ""}`
                      : civillian.reason
                    : "لا يوجد"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                لا يوجد بيانات
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={civillians.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={civillians.page === civillians.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default CivilliansLog;
