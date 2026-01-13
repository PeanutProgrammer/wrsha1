import React, { useState, useEffect } from "react";
import { Table, Alert, Modal, Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
import { io } from "socket.io-client";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const SecurityDelegates = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [delegates, setDelegates] = useState({
    loading: true,
    err: null,
    success: null, // ✅ Added success message
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
      const searchValue = toWesternDigits(delegates.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/delegate?page=${delegates.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setDelegates({
            ...delegates,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setDelegates({
            ...delegates,
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

    socket.on("delegatesUpdated", () => {
      console.log("📢 Delegates updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [delegates.page, delegates.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(delegates.tempSearch.trim());
    setDelegates((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setDelegates((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (delegates.page > 1)
      setDelegates((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (delegates.page < delegates.totalPages)
      setDelegates((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= delegates.totalPages) {
      setDelegates((prev) => ({ ...prev, page: number }));
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
    let start = Math.max(delegates.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, delegates.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === delegates.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedDelegates = [...delegates.results].sort((a, b) => {
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
        <h3 className="text-center mb-3">إدارة المناديب</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={delegates.tempSearch}
              onChange={(e) =>
                setDelegates((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
              }
            />
            {delegates.tempSearch && (
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

      {/* ✅ Success Message */}
      {delegates.success && (
        <Alert variant="success" className="p-2 text-center">
          {delegates.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {delegates.err && (
        <Alert variant="danger" className="p-2 text-center">
          {delegates.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("rank")}>
                الرتبة / الدرجة
                {sortConfig.key === "rank" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("name")}>
                الاسم
                {sortConfig.key === "name" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("unit")}>
                اسم الوحدة
                {sortConfig.key === "unit" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>

              <th onClick={() => handleSort("telephone_number")}>
                رقم الهاتف
                {sortConfig.key === "telephone_number" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("visit_start")}>
                وقت الدخول
                {sortConfig.key === "visit_start" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("visit_end")}>
                وقت الخروج
                {sortConfig.key === "visit_end" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("notes")}>
                سبب الزيارة
                {sortConfig.key === "notes" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(delegates.results) &&
            delegates.results.length > 0 ? (
              sortedDelegates.map((delegate, index) => (
                <tr key={delegate.id}>
                  <td> {(delegates.page - 1) * delegates.limit + index + 1}</td>
                  <td>{delegate.rank}</td>
                  <td>{delegate.name}</td>
                  <td>{delegate.unit}</td>
                  <td>
                    {delegate.telephone_number
                      ? delegate.telephone_number
                      : "لا يوجد"}
                  </td>

                  <td>
                    {moment(delegate.visit_start).format("YYYY-MM-DD HH:mm")}
                  </td>
                  {/* Conditionally show visit_end */}
                  <td>
                    {delegate.visit_end
                      ? moment(delegate.visit_end).format("YYYY-MM-DD HH:mm")
                      : "لا يوجد"}
                  </td>
                  <td>{delegate.notes ? delegate.notes : "لا يوجد"}</td>
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
          disabled={delegates.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={delegates.page === delegates.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default SecurityDelegates;
