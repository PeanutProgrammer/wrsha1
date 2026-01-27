import React, { useState, useEffect, useMemo } from "react";
import "../../style/style.css";
import { Table, Alert, Form, InputGroup, Button, Dropdown, DropdownButton} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const ManageSoldierTmam = () => {
  const auth = getAuthUser();
    const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [soldiers, setSoldiers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
    page: 1,
    totalPages: 1,
    search: "",
    limit: 15,
    tempSearch: "",
  });

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    const fetchData = () => {
      const searchValue = toWesternDigits(soldiers.search.trim());
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/tmam?page=${soldiers.page}&limit=${soldiers.limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          } 
        )
        .then((resp) => {
          setSoldiers({
            ...soldiers,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || soldiers.limit,
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

const sortedSoldiers = useMemo(() => {
  return [...soldiers.results].sort((a, b) => {
    if (!sortConfig.key) return 0;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });
}, [soldiers.results, sortConfig]);



  return (
    <div className="Officers p-5">
      {/* Header: Search + Add + Export */}
      <div className=" header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Page Title */}
        <h3>إدارة تمام الجنود</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍 " 
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
        <Link to="../tmam/add" className="btn btn-success btn-sm mb-0 p-2">
          إنشاء تمام جديد +
        </Link>
      </div>

      {/* Loading Indicator */}
      {soldiers.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error Message */}
      {soldiers.err && (
        <Alert variant="danger" className="p-2 text-center">
          {soldiers.err}
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
                    ? " 🔼" : " 🔽"
                  : ""}{" "}
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
              <th onClick={() => handleSort("tmam")}>
                {sortConfig.key === "tmam"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                التمام
              </th>
              <th onClick={() => handleSort("latest_arrival")}>
                {sortConfig.key === "latest_arrival"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                اخر دخول
              </th>
              <th onClick={() => handleSort("latest_departure")}>
                {sortConfig.key === "latest_departure"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                اخر خروج
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(soldiers.results) && soldiers.results.length > 0 ? (
              sortedSoldiers.map((soldier, index) => (
                <tr key={soldier.mil_id}>
                  <td>{(soldiers.page - 1) * soldiers.limit + index + 1}</td>
                  <td>{soldier.mil_id}</td>
                  <td>{soldier.rank}</td>
                  <td>{soldier.name}</td>
                  <td>{soldier.department}</td>
                    <td>
                    <span
                      className={`status-badge ${
                        soldier.in_unit ? "status-in" : "status-out"
                      }`}
                    >
                                          {soldier.in_unit
                      ? "متواجد"
                      : soldier.tmam
                      ? soldier.tmam
                      : "غير متواجد"}
                    </span>
                  </td>{" "}
<td>
  {soldier.latest_arrival ? (
    <>
      <div>{moment(soldier.latest_arrival).format("YYYY/MM/DD")}</div>
      <div>
        {moment(soldier.latest_arrival).format("hh:mm")}
        <span>
          {moment(soldier.latest_arrival).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>
<td>
  {soldier.latest_departure ? (
    <>
      <div>{moment(soldier.latest_departure).format("YYYY/MM/DD")}</div>
      <div>
        {moment(soldier.latest_departure).format("hh:mm")}
        <span>
          {moment(soldier.latest_departure).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>
                  <td className="d-flex gap-1 p-3"> 
                    {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.mil_id)}}>حذف</button> */}
                    <Link
                      to={`../tmam/${soldier.latest_leave_id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      تعديل
                    </Link>

                    <Link
                      to={`../tmam/details/${soldier.mil_id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      تفاصيل{" "}
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

export default ManageSoldierTmam;
