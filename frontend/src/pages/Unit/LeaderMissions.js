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

const LeaderMissions = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [units, setUnits] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
    page: 1,
    totalPages: 1,
    search: "",
    limit: 15,
    tempSearch: "",
    selectedType: "all", // Track selected filter type (soldiers, ncos, all)
    filterReturningToday: false, // Track if filtering for those returning today
  });

  // Fetch data when page, search, or selectedType change
  useEffect(() => {
    const fetchData = () => {
      const searchValue = toWesternDigits(units.search.trim());

      // Include filterReturningToday in the query parameters
      const url = `${process.env.REACT_APP_BACKEND_BASE_URL}/unit/missions?page=${units.page}&limit=${units.limit}&search=${searchValue}&type=${units.selectedType}&filterReturningToday=${units.filterReturningToday}`;

      axios
        .get(url, {
          headers: { token: auth.token },
        })
        .then((resp) => {
          setUnits({
            ...units,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || units.limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setUnits({
            ...units,
            loading: false,
            err: err.response
              ? JSON.stringify(err.response.data.errors)
              : "Something went wrong while fetching data.",
          });
        });
    };

    fetchData(); // Initial data fetch or when state changes
  }, [
    units.page,
    units.search,
    units.selectedType,
    units.filterReturningToday,
  ]); // Dependency array includes filterReturningToday

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(units.tempSearch.trim());
    setUnits((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [], // Clear results when a new search is performed
    }));
  };

  // Clear search input
  const handleClearSearch = () => {
    setUnits((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [], // Clear results when search is cleared
    }));
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (units.page > 1) setUnits((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (units.page < units.totalPages)
      setUnits((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= units.totalPages) {
      setUnits((prev) => ({ ...prev, page: number }));
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
  const filteredUnits = useMemo(() => {
    let result = units.results;

    // If filterReturningToday is active, filter the units
    if (units.filterReturningToday) {
      const today = moment().format("YYYY/MM/DD");
      result = result.filter((unit) =>
        moment(unit.end_date).isSame(today, "day")
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
  }, [units.results, units.filterReturningToday, sortConfig]);

  // Render pagination buttons
  const renderPageButtons = () => {
    const pages = [];
    const maxButtons = 5;
    let start = Math.max(units.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, units.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === units.page ? "primary" : "outline-primary"}
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
        <h3 className="text-white"> مأموريات اليوم </h3>

        {/* Type Filter Dropdown */}
        <div className="custom-dropdown-button">
          <DropdownButton
            id="dropdown-type-button"
            title={`عرض ${
              units.selectedType === "ncos"
                ? "ضباط الصف"
                : units.selectedType === "soldiers"
                ? "الجنود"
                : units.selectedType === "officers"
                ? "الضباط"
                : "الكل"
            }`}
            variant="outline-secondary"
            onSelect={(e) =>
              setUnits((prev) => ({
                ...prev,
                selectedType: e,
                page: 1,
                results: [],
                loading: true,
              }))
            }
          >
            <Dropdown.Item eventKey="all">عرض الكل</Dropdown.Item>
            <Dropdown.Item eventKey="officers">الضباط</Dropdown.Item>
            <Dropdown.Item eventKey="ncos">ضباط الصف</Dropdown.Item>
            <Dropdown.Item eventKey="soldiers">الجنود</Dropdown.Item>
          </DropdownButton>
        </div>

        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50 shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={units.tempSearch}
              onChange={(e) =>
                setUnits((prev) => ({ ...prev, tempSearch: e.target.value }))
              }
            />
            {units.tempSearch && (
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

        {/* Filter Toggle
        <Form.Check
          type="checkbox"
          label="عرض عودة اليوم"
          checked={units.filterReturningToday}
          onChange={() =>
            setUnits((prev) => ({
              ...prev,
              filterReturningToday: !prev.filterReturningToday,
              page: 1,
              results: [],
              loading: true,
            }))
          }
          className="text-white"
          style={{
            display: "flex",
            alignItems: "baseline",
            // marginRight: '100px',
            flexDirection: "row-reverse",
            flexWrap: "nowrap",
            justifyContent: "flex-start",
          }}
        /> */}
      </div>

      {/* Loading Indicator */}
      {units.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error Message */}
      {units.err && (
        <Alert variant="danger" className="p-2 text-center">
          {units.err}
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
                الرتبة / الدرجة
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
              <th onClick={() => handleSort("destination")}>
                {sortConfig.key === "destination"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
                مأمورية إلى
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
            </tr>
          </thead>
          <tbody>
            {filteredUnits.length > 0 ? (
              filteredUnits.map((unit, index) => (
                <tr key={unit.mil_id}>
                  <td>{(units.page - 1) * units.limit + index + 1}</td>
                  <td>{unit.mil_id}</td>
                  <td>{unit.rank}</td>
                  <td>{unit.name}</td>
                  <td>{unit.department}</td>
                  <td>{unit.destination}</td>
                  <td>
                    {unit.start_date
                      ? moment(unit.start_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
                  <td>
                    {unit.end_date
                      ? moment(unit.end_date).format("YYYY/MM/DD")
                      : "لا يوجد"}
                  </td>
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
          disabled={units.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={units.page === units.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default LeaderMissions;
