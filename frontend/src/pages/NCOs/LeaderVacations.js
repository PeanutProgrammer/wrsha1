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
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const LeaderNCOsVacations = () => {
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
    limit: 15,
    tempSearch: "",
    filterReturningToday: false, // Track if filtering for those returning today
  });

  // Fetch data when page, search, or selectedType change
  useEffect(() => {
    const fetchData = () => {
      const searchValue = toWesternDigits(officers.search.trim());

      // Include filterReturningToday in the query parameters
      const url = `${process.env.REACT_APP_BACKEND_BASE_URL}/nco/vacations?page=${officers.page}&limit=${officers.limit}&search=${searchValue}&type=${officers.selectedType}&filterReturningToday=${officers.filterReturningToday}`;

      axios
        .get(url, {
          headers: { token: auth.token },
        })
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

    fetchData(); // Initial data fetch or when state changes
  }, [officers.page, officers.search, officers.filterReturningToday]); // Dependency array includes filterReturningToday

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(officers.tempSearch.trim());
    setOfficers((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [], // Clear results when a new search is performed
    }));
  };

  // Clear search input
  const handleClearSearch = () => {
    setOfficers((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [], // Clear results when search is cleared
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

    // If filterReturningToday is active, filter the officers
    if (officers.filterReturningToday) {
      const today = moment().format("YYYY/MM/DD");
      result = result.filter((officer) =>
        moment(officer.end_date).isSame(today, "day")
      );
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
  }, [officers.results, officers.filterReturningToday, sortConfig]);

  // Render pagination buttons
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
      {/* Header */}
      <div className="header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h3 className="text-white"> اجازات ضباط الصف </h3>

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

        {/* Filter Toggle */}
        <div className="filter-toggle">
          <input
            type="checkbox"
            id="filterReturningToday"
            checked={officers.filterReturningToday}
            onChange={() =>
              setOfficers((prev) => ({
                ...prev,
                filterReturningToday: !prev.filterReturningToday,
                page: 1,
                results: [],
                loading: true,
              }))
            }
          />
          <label htmlFor="filterReturningToday">عرض عودة اليوم</label>
        </div>
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
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الرقم العسكري
              </th>
              <th onClick={() => handleSort("rank")}>
                {sortConfig.key === "rank"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الدرجة
              </th>
              <th onClick={() => handleSort("name")}>
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الاسم
              </th>
              <th onClick={() => handleSort("department")}>
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الورشة / الفرع
              </th>
              <th onClick={() => handleSort("leave_type_name")}>
                {sortConfig.key === "leave_type_name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                نوع الاجازة
              </th>
              <th onClick={() => handleSort("duration")}>
                {sortConfig.key === "duration"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                المدة
              </th>
              <th onClick={() => handleSort("start_date")}>
                {sortConfig.key === "start_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الفترة من
              </th>
              <th onClick={() => handleSort("end_date")}>
                {sortConfig.key === "end_date"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                الفترة إلى
              </th>
              <th>الرصيد</th>
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
                  <td>{officer.leave_type_name}</td>
                  <td>{officer.duration ? officer.duration : "لا يوجد"}</td>
                  <td>
                    {officer.start_date
                      ? moment(officer.start_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
                  <td>
                    {officer.end_date
                      ? moment(officer.end_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
                  <td>{officer.remaining ? officer.remaining : "لا يوجد"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
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

export default LeaderNCOsVacations;
