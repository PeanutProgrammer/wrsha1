import React, { useState, useEffect } from "react";
import { Table, Alert, Modal, Button, Form, Dropdown, DropdownButton, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
import { io } from "socket.io-client";
import jsPDF from "jspdf";
import "jspdf-autotable";
import htmlDocx from "html-docx-js/dist/html-docx";
import { FaPrint } from "react-icons/fa";
// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const Soldiers = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const [soldiers, setSoldiers] = useState({
    loading: true,
    err: null,
    success: null,
    results: [],
    reload: 0,
    page: 1,
    totalPages: 1,
    search: "",
    limit: 0,
    tempSearch: "",
  });

  const [showConfirm, setShowConfirm] = useState(false); // Modal state
  const [selectedSoldier, setSelectedSoldier] = useState(null); // Selected officer for deletion

  const [endDate, setEndDate] = useState("");
  const [transferID, setTransferID] = useState("");
  const [transferredTo, setTransferredTo] = useState("");

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    // 🔁 Initial fetch
    const fetchData = () => {
      const searchValue = toWesternDigits(soldiers.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/soldier?page=${soldiers.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setSoldiers({
            ...soldiers,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setSoldiers({
            ...soldiers,
            loading: false,
            err: err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
          });
        });
    };

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("soldiersUpdated", () => {
      console.log("📢 Soldiers updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [soldiers.page, soldiers.search]);

  // Show confirmation modal before deleting
  const handleDeleteClick = (soldier) => {
    setSelectedSoldier(soldier);
    setShowConfirm(true);
  };


  // Confirm deletion
  const confirmDelete = () => {
    if (!selectedSoldier) return;



    // Change the API method to DELETE as per the new backend implementation
    axios
      .delete(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/` +
          selectedSoldier.mil_id,
        {
          headers: { token: auth.token },
        }
      )
      .then(() => {
        setShowConfirm(false);
        setSelectedSoldier(null);
        setSoldiers({
          ...soldiers,
          reload: soldiers.reload + 1,
          success: "تم حذف الجندي  بنجاح ✅",
          err: null,
        });
      })
      .catch((err) => {
        setSoldiers({
          ...soldiers,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "Something went wrong. Please try again later.",
        });
        setShowConfirm(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(soldiers.tempSearch.trim());
    setSoldiers((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setSoldiers((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (soldiers.page > 1)
      setSoldiers((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (soldiers.page < soldiers.totalPages)
      setSoldiers((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= soldiers.totalPages) {
      setSoldiers((prev) => ({ ...prev, page: number }));
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
    let start = Math.max(soldiers.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, soldiers.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === soldiers.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedOfficers = [...soldiers.results].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting yet
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "A4",
    });

    doc.setFont("Amiri");

    /* ===== Header ===== */
    doc.setFontSize(18);
    doc.text("إدارة الضباط", doc.internal.pageSize.width / 2, 40, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.text(
      `تم طباعة هذا المستند في: ${getFormattedDate()}`,
      doc.internal.pageSize.width / 2,
      65,
      { align: "center" }
    );

    /* ===== Table Data ===== */
    const tableColumn = [
      "م",
      "الرقم العسكري",
      "الرتبة",
      "الاسم",
      "الورشة / الفرع",
      "تاريخ الضم",
      "ملحق",
      "التمام",
    ];

    const tableRows = [];

    sortedOfficers.forEach((officer, index) => {
      tableRows.push([
        (soldiers.page - 1) * soldiers.limit + index + 1,
        officer.mil_id,
        officer.rank,
        officer.name,
        officer.department,
        moment(officer.join_date).format("YYYY/MM/DD"),
        officer.attached ? "نعم" : "لا",
        officer.in_unit ? "متواجد" : "غير موجود",
      ]);
    });

    /* ===== AutoTable ===== */
    doc.autoTable({
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      styles: {
        font: "Amiri",
        fontSize: 10,
        halign: "center",
        valign: "middle",
        cellPadding: 6,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 30, right: 30 },
      didDrawPage: () => {
        doc.setFontSize(9);
        doc.text(
          `صفحة ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 20,
          { align: "center" }
        );
      },
    });

    doc.save("soldiers.pdf");
  };

  // Function to get current date and time in Arabic format
  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("ar-EG", options); // Arabic (Egypt) locale for Arabic format
  };

  // Export to Word
  const exportToWord = () => {
    const table = document.getElementById("officer-table");
    if (table) {
      // Clone the table to modify it before export
      const tableClone = table.cloneNode(true);

      // Remove the "Actions" column (last column)
      const rows = tableClone.querySelectorAll("tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td, th"); // Include both headers and data cells
        if (cells.length > 0) {
          row.deleteCell(cells.length - 1); // Remove the last cell (Actions column)
        }
      });

      // Get current date in Arabic format
      const currentDate = getFormattedDate();

      // Create header and footer content
      const header = `
      <div style="text-align: center; font-size: 16pt; font-weight: bold; font-family: 'Arial', sans-serif;">
        <p>إدارة الضباط</p>
      </div>
    `;
      const footer = `
      <div style="text-align: center; font-size: 10pt; font-family: 'Arial', sans-serif; color: #888;">
        <p>تم طباعة هذا المستند في: ${currentDate}</p>
      </div>
    `;

      // Set the direction to RTL for the Word document and include header, footer, and the table
      const tableHTML = `
      <div style="direction: rtl; font-family: 'Arial', sans-serif; font-size: 12pt;">
        <!-- Header -->
        ${header}
        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid black; padding: 5px;">الرقم العسكري</th>
              <th style="border: 1px solid black; padding: 5px;">الرتبة</th>
              <th style="border: 1px solid black; padding: 5px;">الإسم</th>
              <th style="border: 1px solid black; padding: 5px;">الورشة / الفرع</th>
              <th style="border: 1px solid black; padding: 5px;">تاريخ الضم</th>
              <th style="border: 1px solid black; padding: 5px;">ملحق</th>
              <th style="border: 1px solid black; padding: 5px;">التمام</th>
            </tr>
          </thead>
          <tbody>
            ${Array.from(rows)
              .map((row, index) => {
                const cells = row.querySelectorAll("td");
                const rowStyle =
                  index % 2 === 0
                    ? "background-color: #ffffff;"
                    : "background-color: #f9f9f9;";
                return `
                  <tr style="${rowStyle}">
                    ${Array.from(cells)
                      .map(
                        (cell) =>
                          `<td style="border: 1px solid black; padding: 5px;">${cell.innerHTML}</td>`
                      )
                      .join("")}
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        <!-- Footer -->
        ${footer}
      </div>
    `;

      // Convert HTML to Word format
      const converted = htmlDocx.asBlob(tableHTML);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(converted);
      link.download = "officers_table.docx";
      link.click();
    } else {
      alert("Table not found!");
    }
  };

  return (
    <div className="Officers p-5">
      {/* Header: Search + Add + Export */}
      <div className=" header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Page Title */}
        <h3>إدارة الجنود</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            {/* <InputGroup.Text className="">🔍</InputGroup.Text> */}
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={soldiers.tempSearch}
              onChange={(e) =>
                setSoldiers((prev) => ({ ...prev, tempSearch: e.target.value }))
              }
            />
            {soldiers.tempSearch && (
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

        {/* Buttons: Add Officer + Export */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="../add" className="btn btn-success btn-sm">
            إنشاء جندي جديد +
          </Link>

         
        </div>
      </div>

      {soldiers.success && (
        <Alert variant="success" className="p-2 text-center">
          {soldiers.success}
        </Alert>
      )}

      {soldiers.err && (
        <Alert variant="danger" className="p-2 text-center">
          {soldiers.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table id="officer-table" striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("mil_id")}>
                {sortConfig.key === "mil_id"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الرقم العسكري
              </th>
              <th onClick={() => handleSort("rank")}>
                الدرجة
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
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الورشة / الفرع
              </th>
              <th onClick={() => handleSort("join_date")}>
                تاريخ الضم
                {sortConfig.key === "join_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("end_date")}>
                تاريخ التسريح
                {sortConfig.key === "end_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>{" "}
              <th onClick={() => handleSort("attached")}>
                ملحق
                {sortConfig.key === "attached"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("in_unit")}>
                التمام
                {sortConfig.key === "in_unit"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(soldiers.results) && soldiers.results.length > 0 ? (
              sortedOfficers.map((officer, index) => (
                <tr key={officer.mil_id}>
                  <td>{(soldiers.page - 1) * soldiers.limit + index + 1}</td>{" "}
                  <td>{officer.mil_id}</td>
                  <td>{officer.rank}</td>
                  <td>{officer.name}</td>
                  <td>{officer.department}</td>
                  <td>{moment(officer.join_date).format("YYYY/MM/DD")}</td>
                  <td>{moment(officer.end_date).format("YYYY/MM/DD")}</td>
                  <td>{officer.attached ? "نعم" : "لا"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        officer.in_unit ? "status-in" : "status-out"
                      }`}
                    >
                      {officer.in_unit ? "متواجد" : "غير موجود"}
                    </span>
                  </td>{" "}
                  <td className="text-center">
                    <div className="d-inline-flex gap-1">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteClick(officer)}
                      >
                        حذف
                      </button>
                      <Link
                        to={`../${officer.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        تعديل
                      </Link>
                      <Link
                        to={`../details/${officer.id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        تفاصيل
                      </Link>
                    </div>
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

      {/* Confirmation Modal for Deleting Officer */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <p>
              هل أنت متأكد أنك تريد حذف الجندي{" "}
              <strong>{selectedSoldier?.name}</strong>؟
            </p>

            {/* Additional Fields */}
          </div>
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

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={soldiers.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={soldiers.page === soldiers.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default Soldiers;
