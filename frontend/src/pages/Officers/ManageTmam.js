import React, { useState, useEffect } from "react";
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

const ManageTmam = () => {
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

    const fetchData = () => {
      const searchValue = toWesternDigits(officers.search.trim());
      const limit = 10;
      const resp = axios
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
    };

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("officersUpdated", () => {
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


  return (
    <div className="Officers p-5">
      {/* Header: Search + Add + Export */}
      <div className=" header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Page Title */}
        <h3>إدارة تمام الضباط</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <InputGroup.Text className="">🔍</InputGroup.Text>
            <Form.Control
              size="sm"
              placeholder="بحث"
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
        <Link to="../add" className="btn btn-success btn-sm mb-0 p-2">
          إنشاء تمام جديد +
        </Link>
      </div>

      {/* Loading Indicator */}
      {officers.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error Message */}
      {officers.err && (
        <Alert variant="danger" className="p-2 text-center">
          {officers.err}
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
                    ? "↑"
                    : "↓"
                  : ""}{" "}
                الرقم العسكري
              </th>
              <th onClick={() => handleSort("rank")}>
                الرتبة
                {sortConfig.key === "rank"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th onClick={() => handleSort("name")}>
                الاسم{" "}
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? "↑"
                    : "↓"
                  : ""}
              </th>
              <th>الورشة / الفرع</th>
              <th>التمام</th>
              <th>اخر دخول</th>
              <th>اخر خروج</th> 
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
                  <td>
                    {officer.in_unit
                      ? "متواجد"
                      : officer.tmam
                      ? officer.tmam
                      : "غير متواجد"}
                  </td>
                                  <td>{officer.latest_arrival ? moment(officer.latest_arrival).format('YYYY-MM-DD HH:mm:ss') : 'لا يوجد'}</td>
                                  <td>{officer.latest_departure ? moment(officer.latest_departure).format('YYYY-MM-DD HH:mm:ss') : 'لا يوجد'}</td>
                  <td className="d-flex gap-1 p-3"> 
                    {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.mil_id)}}>حذف</button> */}
                    <Link
                      to={`../tmam/${officer.latest_leave_id}`}
                      className="btn btn-sm btn-primary mx-1 p-2"
                    >
                      تعديل
                    </Link>

                    <Link
                      to={`../tmam/details/${officer.mil_id}`}
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

export default ManageTmam;
