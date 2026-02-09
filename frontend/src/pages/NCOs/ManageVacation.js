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

const ManageNCOVacation = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [ncos, setNCOs] = useState({
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
      const searchValue = toWesternDigits(ncos.search.trim());

      // Include filterReturningToday in the query parameters
      const url = `${process.env.REACT_APP_BACKEND_BASE_URL}/nco/vacations?page=${ncos.page}&limit=${ncos.limit}&search=${searchValue}&type=${ncos.selectedType}&filterReturningToday=${ncos.filterReturningToday}`;

      axios
        .get(url, {
          headers: { token: auth.token },
        })
        .then((resp) => {
          setNCOs({
            ...ncos,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || ncos.limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setNCOs({
            ...ncos,
            loading: false,
            err: err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
          });
        });
    };

    fetchData(); // Initial data fetch or when state changes
  }, [ncos.page, ncos.search, ncos.filterReturningToday]); // Dependency array includes filterReturningToday

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(ncos.tempSearch.trim());
    setNCOs((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [], // Clear results when a new search is performed
    }));
  };

  // Clear search input
  const handleClearSearch = () => {
    setNCOs((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [], // Clear results when search is cleared
    }));
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (ncos.page > 1)
      setNCOs((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (ncos.page < ncos.totalPages)
      setNCOs((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= ncos.totalPages) {
      setNCOs((prev) => ({ ...prev, page: number }));
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
    let result = ncos.results;

    // If filterReturningToday is active, filter the ncos
    if (ncos.filterReturningToday) {
      const today = moment().format("YYYY/MM/DD");
      result = result.filter((nco) =>
        moment(nco.end_date).isSame(today, "day")
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
  }, [ncos.results, ncos.filterReturningToday, sortConfig]);

  // Render pagination buttons
  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(ncos.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, ncos.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === ncos.page ? "primary" : "outline-primary"}
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
        <h3 className="text-white"> اجازات الضباط </h3>

        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50 shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={ncos.tempSearch}
              onChange={(e) =>
                setNCOs((prev) => ({ ...prev, tempSearch: e.target.value }))
              }
            />
            {ncos.tempSearch && (
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
            checked={ncos.filterReturningToday}
            onChange={() =>
              setNCOs((prev) => ({
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
      {ncos.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error Message */}
      {ncos.err && (
        <Alert variant="danger" className="p-2 text-center">
          {ncos.err}
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
                الرتبة
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
              <th>المدة</th>
              <th>الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {filteredOfficers.length > 0 ? (
              filteredOfficers.map((nco, index) => (
                <tr key={nco.mil_id}>
                  <td>{(ncos.page - 1) * ncos.limit + index + 1}</td>
                  <td>{nco.mil_id}</td>
                  <td>{nco.rank}</td>
                  <td>{nco.name}</td>
                  <td>{nco.department}</td>
                  <td>{nco.leave_type_name}</td>
                  <td>
                    {nco.start_date
                      ? moment(nco.start_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
                  <td>
                    {nco.end_date
                      ? moment(nco.end_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
                  <td>{nco.duration || "لا يوجد"}</td>
                  <td>{nco.remaining || "لا يوجد"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
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
          disabled={ncos.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={ncos.page === ncos.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default ManageNCOVacation;
