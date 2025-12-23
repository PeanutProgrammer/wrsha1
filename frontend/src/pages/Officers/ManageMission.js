import React, { useState, useEffect, useMemo } from "react";
import "../../style/style.css";
import {
  Table,
  Alert,
  Form,
  InputGroup,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const ManageMission = () => {
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
    limit: 20,
    tempSearch: "",
  });

  // State for filter toggle
  const [filterReturningToday, setFilterReturningToday] = useState(false);

  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // backend port

    const fetchData = () => {
      const searchValue = toWesternDigits(officers.search.trim());
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officer/missions?page=${officers.page}&limit=${officers.limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setOfficers({
            ...officers,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || officers.limit,
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
  }, [officers.page, officers.search, officers.limit]);

  // Handling search submit
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

  // Clear search
  const handleClearSearch = () => {
    setOfficers((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  // Pagination handlers
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

  // Sorting logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

 // Filter logic: Apply if filter is active
const filteredOfficers = useMemo(() => {
  let result = officers.results;

  // If filterReturningToday is active, filter the officers for "مأمورية ثابتة"
  if (filterReturningToday) {
    result = result.filter((officer) => officer.leave_type_name === "مأمورية ثابتة");
  }

  // Apply sorting
  if (sortConfig.key) {
    result = result.sort((a, b) => {
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      return 0;
    });
  }

  return result;
}, [officers.results, filterReturningToday, sortConfig]);


  // Render page buttons for pagination
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


  return (
    <div className="Officers p-5">
      {/* Header: Search + Add + Export */}
      <div className="header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        {/* Page Title */}
        <h3 className="text-white">إدارة مأموريات الضباط</h3>

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
        {/* Filter Toggle: Officers returning today */}
        <Form.Check
          type="checkbox"
          label="المأموريات الثابتة"
          checked={filterReturningToday}
          onChange={() => setFilterReturningToday((prev) => !prev)}
          className="text-white"
          style={{
            display: "flex",
            alignItems: "baseline",
            // marginRight: '100px',
            flexDirection: "row-reverse",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
          }}
        />
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
                    ? " 🔼" : " 🔽"
                  : ""} الرقم العسكري</th>
              <th onClick={() => handleSort("rank")}>
                {sortConfig.key === "rank"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} الرتبة</th>
              <th onClick={() => handleSort("name")}>
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} الاسم</th>
              <th onClick={() => handleSort("department")}>
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} الورشة / الفرع</th>
              <th onClick={() => handleSort("leave_type_name")}>
                {sortConfig.key === "leave_type_name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} نوع المأمورية</th>
              <th onClick={() => handleSort("destination")}>
                {sortConfig.key === "destination"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} جهة المأمورية</th>
              <th onClick={() => handleSort("start_date")}>
                {sortConfig.key === "start_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} الفترة من</th>
              <th onClick={() => handleSort("end_date")}>
                {sortConfig.key === "end_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""} الفترة إلى</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfficers.length > 0 ? (
              filteredOfficers.map((officer, index) => (
                <tr key={officer.mil_id}>
                  <td>{(officers.page - 1) * officers.limit + index + 1}</td>
                  <td>{officer.mil_id}</td>
                  <td>{officer.rank}</td>
                  <td>{officer.name}</td>
                  <td>{officer.department}</td>
                  <td>{officer.leave_type_name === "مأمورية ثابتة" ? "مأمورية ثابتة" : "مأمورية"}</td>
                  <td>{officer.leave_type_name === "مأمورية جهاز الخدمات العامة" ? "مأمورية جهاز الخدمات العامة" : officer.destination ? officer.destination : "لا يوجد"}</td>
                  <td>
                    {officer.start_date
                      ? moment(officer.start_date).format("YYYY-MM-DD")
                      : "لا يوجد"}
                  </td>
                  <td>
                    {officer.end_date
                      ? moment(officer.end_date).format("YYYY-MM-DD")
                      : "لا يوجد"}
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

export default ManageMission;
