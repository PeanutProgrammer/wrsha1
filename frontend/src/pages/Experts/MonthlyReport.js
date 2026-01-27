import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { getAuthUser } from "../../helper/Storage";
import {
  Table,
  Button,
  Form,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const MonthlyReport = () => {
  const auth = getAuthUser();
  const [month, setMonth] = useState(moment().month() + 1);
  const [year, setYear] = useState(moment().year());
  const [daysInMonth, setDaysInMonth] = useState(
    moment(`${year}-${month}-01`).daysInMonth()
  );
  const [data, setData] = useState({
    results: [],
    page: 1,
    totalPages: 1,
    limit: 20,
    loading: true,
    err: null,
  });

  const fetchData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true }));
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/expertLog/report?month=${month}&year=${year}&page=${data.page}&limit=${data.limit}`,
        { headers: { token: auth.token } }
      );

      setDaysInMonth(moment(`${year}-${month}-01`).daysInMonth());
      setData((prev) => ({
        ...prev,
        results: res.data.data || [],
        totalPages: res.data.totalPages || 1,
        limit: res.data.limit || 20,
        loading: false,
        err: null,
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        loading: false,
        err: err.response?.data?.message || "حدث خطأ أثناء جلب البيانات",
      }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [month, year, data.page]);

  const handlePrevPage = () => {
    if (data.page > 1) setData((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (data.page < data.totalPages)
      setData((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= data.totalPages) {
      setData((prev) => ({ ...prev, page: number }));
    }
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(data.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, data.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          className={`monthly-report-page-btn ${
            num === data.page ? "active" : ""
          }`}
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="monthly-report-container p-5">
      {/* Title */}
      <div className="monthly-report-header mb-4">
        <h2 className="monthly-report-title text-center">
          🗓️ التقرير الشهري للخبراء
        </h2>
      </div>

      {/* Filters */}
      <div className="monthly-report-filters d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4">
        <InputGroup className="monthly-report-filter">
          <InputGroup.Text>الشهر</InputGroup.Text>
          <Form.Select
            className="monthly-report-select"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {moment().month(i).format("MMMM")}
              </option>
            ))}
          </Form.Select>
        </InputGroup>

        <InputGroup className="monthly-report-filter">
          <InputGroup.Text>السنة</InputGroup.Text>
          <Form.Control
            type="number"
            className="monthly-report-input"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
          />
        </InputGroup>

        <Button
          className="monthly-report-refresh-btn"
          onClick={() => setData((prev) => ({ ...prev, page: 1 }))}
          variant="outline-primary"
        >
          تحديث
        </Button>
      </div>

      {/* Error */}
      {data.err && (
        <Alert variant="danger" className="monthly-report-error text-center">
          {data.err}
        </Alert>
      )}

      {/* Table */}
      <div className="monthly-report-table-wrapper shadow-sm rounded bg-white">
        <Table
          bordered
          hover
          size="sm"
          className="monthly-report-table text-center"
        >
          <thead className="monthly-report-thead">
            <tr>
              <th rowSpan="2" className="sticky-col">
                م
              </th>
              <th rowSpan="2" className="sticky-col">
                رقم تحقيق الشخصية
              </th>
              <th rowSpan="2" className="sticky-col">
                الاسم
              </th>
              <th colSpan={daysInMonth}>الأيام</th>
            </tr>
            <tr>
              {Array.from({ length: daysInMonth }, (_, i) => (
                <th key={i} className="monthly-report-day-header">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.loading ? (
              <tr>
                <td
                  colSpan={3 + daysInMonth}
                  className="monthly-report-loading text-center"
                >
                  <Spinner animation="border" size="sm" className="me-2" /> جاري
                  التحميل...
                </td>
              </tr>
            ) : data.results.length > 0 ? (
              data.results.map((exp, index) => (
                <tr key={exp.id} className="monthly-report-row">
                  <td className="sticky-col">
                    {(data.page - 1) * data.limit + index + 1}
                  </td>
                  <td className="sticky-col">{exp.id}</td>
                  <td className="sticky-col">{exp.name}</td>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <td
                      key={i}
                      className={`monthly-report-day ${
                        exp.days.includes(i + 1) ? "present-day" : "absent-day"
                      }`}
                      title={exp.days.includes(i + 1) ? "حاضر" : "غائب"} // Tooltip
                    >
                      <span>{exp.days.includes(i + 1) ? "✔" : "✘"}</span>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3 + daysInMonth}
                  className="monthly-report-no-data text-center"
                >
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={data.page === 1}
          className="pagination-arrow"
        >
          <FaChevronRight />
        </Button>
        {renderPageButtons()}
        <Button
          onClick={handleNextPage}
          disabled={data.page === data.totalPages}
          className="pagination-arrow"
        >
          <FaChevronLeft />
        </Button>
      </div>
    </div>
  );
};

export default MonthlyReport;
