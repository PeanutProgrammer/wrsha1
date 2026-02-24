import React, { useState, useEffect } from "react";
import {
  Table,
  Alert,
  Modal,
  Button,
  Form,
  Dropdown,
  DropdownButton,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import "jspdf-autotable"; // This imports the autoTable plugin
import htmlDocx from "html-docx-js/dist/html-docx";
import { FaPrint } from "react-icons/fa"; // Import the printer icon from react-icons

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const LeaderOfficers = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [officers, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
    page: 1,
    totalPages: 1,
    search: "",
    limit: 0,
    tempSearch: "",
  });
  const [dailySummary, setDailySummary] = useState({
    total: 0,
    available: 0,
    missing: 0,
    تمام_الخوارج: {
      ثابتة: 0,
      فرقة_دورة: 0,
      راحة: 0,
      بدل_راحة: 0,
      عارضة: 0,
      اجازة_ميدانية: 0,
      منحة: 0,
      اجازة_سنوية: 0,
      اجازة_مرضية: 0,
      سفر: 0,
      مأمورية: 0,
      مستشفى: 0,
    },
    اجمالي_الخوارج: 0,
    percentageAvailable: 0,
  });

  // Fetch officers data and summary from the backend
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // backend port

    const fetchData = () => {
      const searchValue = officers.search.trim();
      const limit = 15;

      // Fetch officers with search filter and pagination
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officer/tmam?page=${officers.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setOfficers({
            ...officers,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setOfficers({
            ...officers,
            loading: false,
            err: err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
          });
        });

      // Fetch daily summary
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officer/daily-summary`,
          {
            headers: { token: auth.token },
          }
        )
        .then((response) => {
          setDailySummary(response.data);
        })
        .catch((err) => {
          console.error("Error fetching daily summary", err);
        });
    };

    fetchData(); // Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("officersUpdated", () => {
      console.log("📢 Officers updated — refetching data...");
      fetchData(); // Re-fetch on update
    });

    return () => socket.disconnect();
  }, [officers.page, officers.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(officers.tempSearch.trim());
    setOfficers((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setOfficers((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (officers.page > 1)
      setOfficers((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (officers.page < officers.totalPages)
      setOfficers((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= officers.totalPages) {
      setOfficers((prev) => ({ ...prev, page: number }));
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(officers.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, officers.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === officers.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedOfficers = [...officers.results].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting yet
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });

  return (
    <div className="Officers p-5">
      {/* Header */}
      <div className="header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h3 className="text-white"> تمام الضباط </h3>

        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50 shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={officers.tempSearch}
              onChange={(e) =>
                setOfficers((prev) => ({ ...prev, tempSearch: e.target.value }))
              }
            />
            {officers.tempSearch && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={handleClearSearch}
              >
                ×
              </Button>
            )}
          </InputGroup>
        </Form>

        <Link to="../officer-view">
          <Button size="md" variant="primary" className="px-3">
            بيانات الضباط
          </Button>
        </Link>
      </div>

      <div className="daily-summary mt-4">
        <Table striped bordered hover size="sm">
          <thead className="table-dark">
            <tr className="table-summary-subheader">
              <th colSpan="2">الإجمالي</th>
              <th colSpan="8" className="table-summary-header">
                تمام الخوارج
              </th>
              <th rowSpan={2}>اجمالي الخوارج</th>
              <th rowSpan={2}>موجود</th>
              <th rowSpan={2}>نسبة الخوارج</th>
            </tr>
            <tr className="table-summary-subheader">
              <th>القوة</th>
              <th>الملاحق</th>
              <th>مأمورية ثابتة</th>
              <th>فرقة / دورة</th>
              <th>اجازة عادية</th>
              <th>اجازة سنوية</th>
              <th>اجازة مرضية</th>
              <th>سفر</th>
              <th>مأمورية</th>
              <th>مستشفى</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{dailySummary.total}</td>
              <td>{dailySummary.attached}</td>
              <td>{dailySummary?.تمام_الخوارج?.مأمورية_ثابتة || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.فرقة_دورة || 0}</td>
              <td>
                {dailySummary?.تمام_الخوارج?.راحة +
                  dailySummary?.تمام_الخوارج?.بدل_راحة +
                  dailySummary?.تمام_الخوارج?.عارضة +
                  dailySummary?.تمام_الخوارج?.اجازة_ميدانية +
                  dailySummary?.تمام_الخوارج?.اجازة_مأمورية +
                  dailySummary?.تمام_الخوارج?.منحة || 0}
              </td>
              <td>{dailySummary?.تمام_الخوارج?.اجازة_سنوية || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.اجازة_مرضية || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.سفر || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.مأمورية || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.مستشفى || 0}</td>
              <td>{dailySummary.missing}</td>
              <td>{dailySummary.available}</td>
              <td className="percentage-column">
                {dailySummary.percentageAvailable} %
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      {officers.err && (
        <Alert variant="danger" className="p-2">
          {officers.err}
        </Alert>
      )}
      {officers.success && (
        <Alert variant="success" className="p-2">
          {officers.success}
        </Alert>
      )}

      <div className="table-responsive shadow-sm rounded bg-white">
        <Table id="officer-table" striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("mil_id")}>
                {sortConfig.key === "mil_id"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                الرقم العسكري
              </th>
              <th onClick={() => handleSort("rank")}>
                الرتبة
                {sortConfig.key === "rank"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("name")}>
                الاسم{" "}
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("department")}>
                الورشة / الفرع
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("tmam")}>
                {sortConfig.key === "tmam"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                التواجد
              </th>
              <th>التمام</th>
              <th onClick={() => handleSort("latest_arrival")}>
                اخر دخول
                {sortConfig.key === "latest_arrival"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("latest_departure")}>
                اخر خروج
                {sortConfig.key === "latest_departure"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(officers.results) && officers.results.length > 0 ? (
              sortedOfficers.map((officer, index) => (
                <tr key={officer.mil_id}>
                  <td>{(officers.page - 1) * officers.limit + index + 1}</td>
                  <td>{officer.mil_id}</td>
                  <td>{officer.rank}</td>
                  <td>{officer.name}</td>
                  <td>{officer.department}</td>
                  <td
                    className={
                      officer.in_unit
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                    }
                  >
                    {officer.in_unit ? "متواجد" : "غير موجود"}
                  </td>
                  <td>{officer.active_tmam ?? "بالوحدة"}</td>

                  <td>
                    {officer.latest_arrival ? (
                      <>
                        <div>
                          {moment(officer.latest_arrival).format("YYYY/MM/DD")}
                        </div>
                        <div>
                          {moment(officer.latest_arrival).format("hh:mm a")}
                        </div>
                      </>
                    ) : (
                      "لا يوجد"
                    )}
                  </td>

                  <td>
                    {officer.latest_departure ? (
                      <>
                        <div>
                          {moment(officer.latest_departure).format(
                            "YYYY/MM/DD"
                          )}
                        </div>
                        <div>
                          {moment(officer.latest_departure).format("hh:mm a")}
                        </div>
                      </>
                    ) : (
                      "لا يوجد"
                    )}
                  </td>
                  <td className=" gap-1 p-1">
                    <Link
                      to={`../officers/tmam/details/${officer.mil_id}`}
                      className="btn btn-sm btn-secondary mx-1 p-2"
                    >
                      تفاصيل
                    </Link>
                    <Link
                      to={`../officer-vacation-log/${officer.mil_id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      الاجازات السابقة{" "}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={officers.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={officers.page === officers.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default LeaderOfficers;
