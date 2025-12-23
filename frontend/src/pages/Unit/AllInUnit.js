import React, { useState, useEffect } from 'react';
import { Table, Alert, Modal, Button, Form,  Dropdown, DropdownButton, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';
import { io } from "socket.io-client";
import jsPDF from 'jspdf';
import 'jspdf-autotable';  // This imports the autoTable plugin
import htmlDocx from 'html-docx-js/dist/html-docx';
import { FaPrint } from 'react-icons/fa';  // Import the printer icon from react-icons

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const AllInUnit = () => {
  const auth = getAuthUser();
    const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [units, setUnits] = useState({
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
      const searchValue = toWesternDigits(units.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/unit?page=${units.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setUnits({
            ...units,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
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

    fetchData(); // ✅ Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("unitsUpdated", () => {
      console.log("📢 Units updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [units.page, units.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(units.tempSearch.trim());
    setUnits((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setUnits((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (units.page > 1)
      setUnits((prev) => ({ ...prev, page: prev.page - 1 }));
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

  const sortedUnits = [...units.results].sort((a, b) => {
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
        <h3 className="text-center mb-3">إدارة المتواجدين بالوحدة</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={units.tempSearch}
              onChange={(e) =>
                setUnits((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
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
      </div>




      {units.err && (
        <Alert variant="danger" className="p-2">
          {units.err}
        </Alert>
      )}
      {units.success && (
        <Alert variant="success" className="p-2">
          {units.success}
        </Alert>
      )}

      <div className="table-responsive">
        <Table id="officer-table" striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("mil_id")}>الرقم العسكري
                {sortConfig.key === "mil_id" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("rank")}>الرتبة / الدرجة
                {sortConfig.key === "rank" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("name")}>الاسم
                {sortConfig.key === "name" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("department")}>الورشة / الفرع
                {sortConfig.key === "department" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("event_time")}>اخر دخول
                {sortConfig.key === "event_time" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(units.results) &&
            units.results.length > 0 ? (
            sortedUnits.map((unit,index) => (
              <tr key={unit.mil_id}>
                <td>{(units.page - 1) * units.limit + index + 1}</td>
                <td>{unit.mil_id}</td>
                <td>{unit.rank}</td>
                <td>{unit.name}</td>
                <td>{unit.department}</td>
                <td>{ unit.event_time ? moment(unit.event_time).format('YYYY-MM-DD HH:mm') : "لا يوجد"}</td>
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

export default AllInUnit;
