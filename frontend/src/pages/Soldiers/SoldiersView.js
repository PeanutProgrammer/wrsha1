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

const SoldiersView = () => {
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

 

  return (
    <div className="Officers p-5">
      {/* Header: Search + Add + Export */}
      <div className=" header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Page Title */}
        <h3>بيانات الجنود</h3>
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
                    
                      <Link
                        to={`../soldiers/details/${officer.id}`}
                        className="btn btn-sm btn-primary"
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

export default SoldiersView;
