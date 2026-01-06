import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form,  Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";
import 'jspdf-autotable';  // This imports the autoTable plugin
import htmlDocx from 'html-docx-js/dist/html-docx';
import { FaPrint } from 'react-icons/fa';  // Import the printer icon from react-icons

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};


const LeaderCivillians = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });

  const [civillians, setCivillians] = useState({
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

    const fetchData = () => {
      const searchValue = toWesternDigits(civillians.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/civillian/tmam?page=${civillians.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setCivillians({
            ...civillians,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setCivillians({
            ...civillians,
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

    socket.on("civilliansUpdated", () => {
      console.log("📢 Civillians updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
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

  const sortedCivillians = [...civillians.results].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting yet
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة المدنيين</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={civillians.tempSearch}
              onChange={(e) =>
                setCivillians((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
              }
            />
            {civillians.tempSearch && (
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

      {civillians.err && (
        <Alert variant="danger" className="p-2">
          {civillians.err}
        </Alert>
      )}
      {civillians.success && (
        <Alert variant="success" className="p-2">
          {civillians.success}
        </Alert>
      )}

      <div className="table-responsive">
        <Table id="civillian-table" striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("nationalID")}>
                {sortConfig.key === "nationalID"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                الرقم القومي
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
              <th onClick={() => handleSort("in_unit")}>
                التمام
                {sortConfig.key === "in_unit"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
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
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(civillians.results) &&
            civillians.results.length > 0 ? (
              sortedCivillians.map((civillian, index) => (
                <tr key={civillian.nationalID}>
                  <td>
                    {(civillians.page - 1) * civillians.limit + index + 1}
                  </td>
                  <td>{civillian.nationalID}</td>
                  <td>{civillian.name}</td>
                  <td>{civillian.department}</td>
                                    <td
                    className={
                      civillian.in_unit
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                    }
                  >
                    {civillian.in_unit ? "متواجد" : "غير موجود"}
                  </td>
                 <td>
  {civillian.latest_arrival ? (
    <>
      <div>{moment(civillian.latest_arrival).format("YYYY-MM-DD")}</div>
      <div>
        {moment(civillian.latest_arrival).format("hh:mm")}
        <span>
          {moment(civillian.latest_arrival).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>

<td>
  {civillian.latest_departure ? (
    <>
      <div>{moment(civillian.latest_departure).format("YYYY-MM-DD")}</div>
      <div>
        {moment(civillian.latest_departure).format("hh:mm")}
        <span>
          {moment(civillian.latest_departure).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>

                  <td>{civillian.in_unit ? "لا يوجد" : civillian.tmam}</td>
                  {/* <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteClick(officer)}
                    >
                      حذف
                    </button>
                    <Link to={`${officer.id}`} className="btn btn-sm btn-primary">
                      تعديل
                    </Link>
                    <Link to={`details/${officer.id}`} className="btn btn-sm btn-primary">
                      تفاصيل
                    </Link>
                  </div>
                </td> */}
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

export default LeaderCivillians;
