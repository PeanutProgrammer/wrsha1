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
  Collapse,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
import { io } from "socket.io-client";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // This imports the autoTable plugin
import htmlDocx from "html-docx-js/dist/html-docx";
import { FaPrint } from "react-icons/fa"; // Import the printer icon from react-icons
import amiriFont from "../../assets/fonts/AmiriBase64.js"; // Import the font as base64
import amiriBold from "../../assets/fonts/Amiri-BoldBase64.js"; // Import the bold font as base64
import "moment/locale/ar"; // make sure Arabic locale is loaded

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const LeaderUnits = () => {
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
      مأمورية_ثابتة: 0,
      فرقة_دورة: 0,
      راحة: 0,
      بدل_راحة: 0,
      عارضة: 0,
      اجازة_ميدانية: 0,
      منحة: 0,
      اجازة_سنوية: 0,
      اجازة_مرضية: 0,
      اجازة_مأمورية: 0,

      سفر: 0,
      مأمورية: 0,
      مستشفى: 0,
    },
    اجمالي_الخوارج: 0,
    percentageAvailable: 0,
  });
  const [rankSummary, setRankSummary] = useState({
    ranks: [],
    totals: {
      total: 0,
      available: 0,
      missing: 0,
      attached: 0,
    },
  });
  const [showDailySummary, setShowDailySummary] = useState(true);
  const [showRankSummary, setShowRankSummary] = useState(true);
  const [showUnitTable, setShowUnitTable] = useState(true);

  // Fetch officers data and summary from the backend
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // backend port

    const fetchData = () => {
      const searchValue = officers.search.trim();
      const limit = 10;

      // Fetch officers with search filter and pagination
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/unit?page=${officers.page}&limit=${limit}&search=${searchValue}`,
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
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/unit/daily-summary`, {
          headers: { token: auth.token },
        })
        .then((response) => {
          setDailySummary(response.data);
        })
        .catch((err) => {
          console.error("Error fetching daily summary", err);
        });

      // Fetch rank summary
      axios
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/unit/rank-summary`, {
          headers: { token: auth.token },
        })
        .then((resp) => {
          setRankSummary(resp.data);
        })
        .catch((err) => {
          console.error("Error fetching rank summary", err);
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

  const printSection = (sectionId) => {
    const doc = new jsPDF("landscape", "pt", "a4");

    // Add your base64 font
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    doc.setFont("Amiri");

    const table = document.querySelector(`#${sectionId} table`);
    if (!table) {
      alert("لا يوجد جدول للطباعة!");
      return;
    }

    // Get header and body data
    const headers = Array.from(table.querySelectorAll("thead tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th")).map((th) => th.innerText)
    );

    const body = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.innerText)
    );

    // Reverse columns for RTL PDF
    const reversedHeaders = headers.map((row) => row.reverse());
    const reversedBody = body.map((row) => row.reverse());

    autoTable(doc, {
      head: reversedHeaders,
      body: reversedBody,
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 3,
        halign: "right",
      },
      headStyles: {
        halign: "right",
        font: "Amiri", // THIS is important — header uses Arabic font too
        fontStyle: "bold",
      },
      bodyStyles: { halign: "right" },
      rtl: true, // this ensures PDF flow is right-to-left
    });

    doc.save(`${sectionId}.pdf`);
  };

  const printRankSummary = () => {
    const doc = new jsPDF("landscape", "pt", "a4");

    // Add base64 fonts
    doc.addFileToVFS("Amiri-Regular.ttf", amiriFont);
    doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
    doc.addFileToVFS("Amiri-Bold.ttf", amiriBold);
    doc.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    doc.setFont("Amiri", "normal");

    const table = document.querySelector(`#rank-summary-section table`);
    if (!table) {
      alert("لا يوجد جدول للطباعة!");
      return;
    }

    // Table headers and body
    const headers = Array.from(table.querySelectorAll("thead tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th")).map((th) => th.innerText)
    );
    const body = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
      Array.from(tr.querySelectorAll("td")).map((td) => td.innerText)
    );

    const reversedHeaders = headers.map((row) => row.reverse());
    const reversedBody = body.map((row) => row.reverse());

    const pageWidth = doc.internal.pageSize.getWidth();

    // Current date in Arabic
    const now = moment().locale("ar");
    const dateStr = now.format("YYYY/MMMM/DD"); // e.g., 27 يناير 2026

    // Top-right header block
    const headerLines = [
      "إدارة الأسلحة والذخيرة",
      "الورش الرئيسية للأسلحة رقم 1",
      "فرع نظم المعلومات",
      `التاريخ: ${dateStr}`,
    ];
    doc.setFont("Amiri", "bold");
    doc.setFontSize(12);
    let startY = 20; // starting Y position
    headerLines.forEach((line) => {
      doc.text(line, pageWidth - 10, startY, { align: "right" });
      startY += 15; // line spacing
    });

    // Title with day and date in parentheses
    const dayName = now.format("dddd"); // Arabic day name
    const titleText = `يومية عددية بالرتب عن يوم ${dayName} الموافق ${dateStr}`;
    doc.setFont("Amiri", "bold");
    doc.setFontSize(16);
    doc.text(titleText, pageWidth / 2, startY + 10, { align: "center" });

    // AutoTable
    autoTable(doc, {
      startY: startY + 30, // leave space for header and title
      head: reversedHeaders,
      body: reversedBody,
      styles: {
        font: "Amiri",
        fontSize: 10,
        cellPadding: 3,
        halign: "right",
      },
      headStyles: {
        halign: "right",
        font: "Amiri",
        fontStyle: "bold",
      },
      bodyStyles: { halign: "right" },
      rtl: true,
    });

    // Footer with Arabic AM/PM
    const arabicMeridiem = now.format("a") === "am" ? "ص" : "م";
    const currentDateTime =
      now.format("YYYY/MM/DD hh:mm") + " " + arabicMeridiem;
    const footerText = `تمت الطباعة في ${currentDateTime} بواسطة ${auth.name}`;
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(10);
    doc.setFont("Amiri", "normal");
    doc.text(footerText, pageWidth / 2, pageHeight - 20, { align: "center" });

    doc.save(`rank-summary.pdf`);
  };

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">تمام الوحدة</h3>
        <div className="section-nav d-flex gap-3 mb-4 p-2 rounded shadow-sm bg-light">
          <a href="#daily-summary-section">📊 يومية عددية</a>
          <a href="#rank-summary-section">📈 يومية عددية بالرتب</a>
          <a href="#unit-section">📋 الموجودين بالوحدة</a>
        </div>
      </div>

      {/* DAILY SUMMARY HEADER */}
      <div id="daily-summary-section" className="section-anchor">
        <div
          className="section-header d-flex justify-content-between align-items-center mt-4 section-blue"
          onClick={() => setShowDailySummary((v) => !v)}
        >
          <h5 className="section-title">📊 يومية عددية</h5>
          <div className="d-flex align-items-center gap-2">
            {/* <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation(); // prevent collapse toggle
                printSection("daily-summary-section");
              }}
            >
              <FaPrint /> طباعة
            </button> */}
            <span className={`section-arrow ${showDailySummary ? "open" : ""}`}>
              ▼
            </span>
          </div>
        </div>

        {/* DAILY SUMMARY CONTENT */}
        <Collapse in={showDailySummary}>
          <div id="section-content">
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
        </Collapse>
      </div>
      {/* RANK SUMMARY HEADER */}
      <div id="rank-summary-section" className="section-anchor">
        <div
          className="section-header d-flex justify-content-between align-items-center mt-4 section-green"
          onClick={() => setShowRankSummary((v) => !v)}
        >
          <h5 className="section-title">📈 يومية عددية بالرتب</h5>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation(); // prevent collapse toggle
                printRankSummary();
              }}
            >
              <FaPrint /> طباعة
            </button>
            <span className={`section-arrow ${showRankSummary ? "open" : ""}`}>
              ▼
            </span>
          </div>
        </div>

        <Collapse in={showRankSummary}>
          <div className="section-content shadow-sm rounded bg-white p-2 mb-3">
            <Table striped bordered hover size="sm" className="table-compact">
              <thead className="table-dark">
                <tr>
                  <th>الرتبة / الدرجة</th>
                  <th>الإجمالي</th>
                  <th>موجود</th>
                  <th>خارج</th>
                  <th>ملاحق</th>
                  <th>نسبة الخوارج</th>
                </tr>
              </thead>
              <tbody>
                {rankSummary.ranks.length > 0 ? (
                  rankSummary.ranks.map((r) => {
                    const percentage = r.total
                      ? ((r.missing / r.total) * 100).toFixed(1)
                      : 0;

                    return (
                      <tr key={r.rank}>
                        <td>{r.rank}</td>
                        <td>{r.total}</td>
                        <td>{r.available}</td>
                        <td>{r.missing}</td>
                        <td>{r.attached}</td>
                        <td className="percentage-cell">
                          <div className="percentage-bar">
                            <span style={{ width: `${percentage}%` }} />
                          </div>
                          <small>{percentage} %</small>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      لا توجد بيانات
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Totals row */}
              <tfoot className="table-secondary fw-bold">
                <tr>
                  <td>الإجمالي</td>
                  <td>{rankSummary.totals.total}</td>
                  <td>{rankSummary.totals.available}</td>
                  <td>{rankSummary.totals.missing}</td>
                  <td>{rankSummary.totals.attached}</td>
                  <td>
                    {rankSummary.totals.total
                      ? (
                          (rankSummary.totals.missing /
                            rankSummary.totals.total) *
                          100
                        ).toFixed(1)
                      : 0}{" "}
                    %
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </Collapse>
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
      {/* Unit HEADER */}
      <div id="unit-section" className="section-anchor">
        <div
          className="section-header d-flex justify-content-between align-items-center mt-4 section-orange"
          onClick={() => setShowUnitTable((v) => !v)}
        >
          <h5 className="section-title">📋 الموجودين اليوم</h5>
          <div className="d-flex align-items-center gap-2">
            {/* <button
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={(e) => {
                e.stopPropagation(); // prevent collapse toggle
                printSection("unit-section");
              }}
            >
              <FaPrint /> طباعة
            </button> */}
            <span className={`section-arrow ${showUnitTable ? "open" : ""}`}>
              ▼
            </span>
          </div>
        </div>

        {/* DAILY SUMMARY CONTENT */}
        <Collapse in={showUnitTable}>
          <div className="section-content">
            <div id="unit-table" className="mb-3">
              {/* Search bar */}

              <Form
                className="d-flex align-items-center flex-grow-1"
                onSubmit={handleSearchSubmit}
              >
                <InputGroup className="w-50  shadow-sm me-5 mt-2">
                  <Form.Control
                    size="sm"
                    placeholder="بحث 🔍"
                    value={officers.tempSearch}
                    onChange={(e) =>
                      setOfficers((prev) => ({
                        ...prev,
                        tempSearch: e.target.value,
                      }))
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
            </div>

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

                    <th onClick={() => handleSort("event_time")}>
                      اخر دخول
                      {sortConfig.key === "event_time"
                        ? sortConfig.direction === "asc"
                          ? " 🔼"
                          : " 🔽"
                        : ""}
                    </th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(officers.results) &&
                  officers.results.length > 0 ? (
                    sortedOfficers.map((officer, index) => (
                      <tr key={officer.mil_id}>
                        <td>
                          {(officers.page - 1) * officers.limit + index + 1}
                        </td>
                        <td>{officer.mil_id}</td>
                        <td>{officer.rank}</td>
                        <td>{officer.name}</td>
                        <td>{officer.department}</td>

                        <td>
                          {officer.event_time ? (
                            <>
                              <div>
                                {moment(officer.event_time).format(
                                  "YYYY/MM/DD"
                                )}
                              </div>
                              <div>
                                {moment(officer.event_time).format("hh:mm a")}
                              </div>
                            </>
                          ) : (
                            "لا يوجد"
                          )}
                        </td>

                        <td>{officer.in_unit ? "لا يوجد" : officer.tmam}</td>
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
        </Collapse>
      </div>
    </div>
  );
};

export default LeaderUnits;
