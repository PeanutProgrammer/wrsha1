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

const ManageNCOs = () => {
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





  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    // 🔁 Initial fetch
    const fetchData = () => {
      const searchValue = toWesternDigits(officers.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/nco?page=${officers.page}&limit=${limit}&search=${searchValue}`,
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
    };

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("ncosUpdated", () => {
      console.log("📢 Officers updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
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

  // Export to PDF using pdfmake
  // const exportToPDF = () => {
  //   const documentDefinition = {
  //     content: [
  //       {
  //         text: 'إدارة الضباط',
  //         style: 'header',
  //         alignment: 'center',
  //         font: 'Amiri'
  //       },
  //       {
  //         text: `تم طباعة هذا المستند في: ${getFormattedDate()}`,
  //         style: 'subheader',
  //         alignment: 'center',

  //       },
  //       {
  //         table: {
  //           widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
  //           body: [
  //             [
  //               { text: 'الرقم العسكري', style: 'tableHeader' },
  //               { text: 'الرتبة', style: 'tableHeader' },
  //               { text: 'الإسم', style: 'tableHeader' },
  //               { text: 'الورشة / الفرع', style: 'tableHeader' },
  //               { text: 'تاريخ الضم', style: 'tableHeader' },
  //               { text: 'التمام', style: 'tableHeader' },
  //             ],
  //             ...currentRecords.map((officer) => [
  //               officer.mil_id,
  //               officer.rank,
  //               officer.name,
  //               officer.department,
  //               moment(officer.join_date).format('YYYY/MM/DD'),
  //               officer.in_unit ? 'متواجد' : 'غير موجود',
  //             ]),
  //           ],
  //         },
  //         layout: 'lightHorizontalLines',
  //       },
  //       {
  //         text: `تم طباعة هذا المستند في: ${getFormattedDate()}`,
  //         style: 'footer',
  //         alignment: 'center',
  //       },
  //     ],
  //     styles: {
  //       header: {
  //         fontSize: 18,
  //         bold: true,
  //       },
  //       subheader: {
  //         fontSize: 12,
  //         italics: true,
  //       },
  //       footer: {
  //         fontSize: 10,
  //         color: '#888',
  //       },
  //       tableHeader: {
  //         bold: true,
  //         fontSize: 12,
  //         alignment: 'center',
  //         fillColor: '#f2f2f2',
  //       },
  //     },
  //   };

  //   // Generate and open the PDF
  //   pdfMake.createPdf(documentDefinition).open();
  // };
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
        <h3>إدارة ضباط الصف</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder=" بحث 🔍" 
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

        {/* Buttons: Add Officer + Export */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="../add" className="btn btn-success btn-sm">
            إنشاء ضابط صف جديد +
          </Link>

          <Dropdown>
            <DropdownButton
              variant="secondary"
              id="export-dropdown"
              title={
                <>
                  <FaPrint className="me-1" /> طباعة
                </>
              }
            >
              <Dropdown.Item onClick={exportToWord}>Word</Dropdown.Item>
              {/* Add PDF option if needed */}
            </DropdownButton>
          </Dropdown>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded bg-white">
        <Table id="officer-table" striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("mil_id")}>
                {sortConfig.key === "mil_id"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
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
            {Array.isArray(officers.results) && officers.results.length > 0 ? (
              sortedOfficers.map((officer, index) => (
                <tr key={officer.mil_id}>
                  <td>{(officers.page - 1) * officers.limit + index + 1}</td>
                  <td>{officer.mil_id}</td>
                  <td>{officer.rank}</td>
                  <td>{officer.name}</td>
                  <td>{officer.department}</td>
                  <td>{moment(officer.join_date).format("YYYY/MM/DD")}</td>
                  <td>{officer.attached ? "نعم" : "لا"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        officer.in_unit ? "status-in" : "status-out"
                      }`}
                    >
                      {officer.in_unit ? "متواجد" : "غير موجود"}
                    </span>
                  </td>{" "}                  <td>

                    <Link
                      to={`../${officer.id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      تعديل
                    </Link>
                    <Link
                      to={`../details/${officer.id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      تفاصيل
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

export default ManageNCOs;
