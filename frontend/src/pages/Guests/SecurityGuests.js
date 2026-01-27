import React, { useState, useEffect } from "react";
import { Table, Alert, Modal, Button, InputGroup, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
import { io } from "socket.io-client";

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};
const SecurityGuests = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const [guests, setGuests] = useState({
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
      const searchValue = toWesternDigits(guests.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/guest?page=${guests.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setGuests({
            ...guests,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setGuests({
            ...guests,
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

    socket.on("guestsUpdated", () => {
      console.log("📢 guests updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [guests.page, guests.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(guests.tempSearch.trim());
    setGuests((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setGuests((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (guests.page > 1)
      setGuests((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (guests.page < guests.totalPages)
      setGuests((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= guests.totalPages) {
      setGuests((prev) => ({ ...prev, page: number }));
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
    let start = Math.max(guests.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, guests.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === guests.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedGuests = [...guests.results].sort((a, b) => {
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
        <h3 className="text-center mb-3">إدارة الزوار</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={guests.tempSearch}
              onChange={(e) =>
                setGuests((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
              }
            />
            {guests.tempSearch && (
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
      {guests.success && (
        <Alert variant="success" className="p-2 text-center">
          {guests.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {guests.err && (
        <Alert variant="danger" className="p-2 text-center">
          {guests.err}
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
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼" : " 🔽"
                  : ""}{" "}
                الاسم
              </th>
               <th onClick={() => handleSort("unit")}>
                اسم الوحدة / الشركة
                {sortConfig.key === "unit" && (
                  <span>{sortConfig.direction === "asc" ? " 🔼" : " 🔽"}</span>
                )}
              </th>
              <th onClick={() => handleSort("visit_to")}>
                {sortConfig.key === "visit_to"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                زيارة إلى
              </th>
              <th onClick={() => handleSort("visit_start")}>
                {sortConfig.key === "visit_start"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                وقت الدخول
              </th>
              <th onClick={() => handleSort("visit_end")}>
                {sortConfig.key === "visit_end"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                وقت الخروج
              </th>
              <th onClick={() => handleSort("reason")}>
                {sortConfig.key === "reason"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                سبب الزيارة
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGuests.map((guest, index) => (
              <tr key={guest.id}>
                <td> {(guests.page - 1) * guests.limit + index + 1}</td>
                <td>{guest.rank ? guest.rank : "لا يوجد"}</td>
                <td>{guest.name}</td>
                <td>{guest.unit ? guest.unit : "لا يوجد"}</td>
                <td>{guest.officer_rank + " " + guest.officer_name}</td>
<td>
  {guest.visit_start ? (
    <>
      <div>{moment(guest.visit_start).format("YYYY/MM/DD")}</div>
      <div>
        {moment(guest.visit_start).format("hh:mm")}
        <span>
          {moment(guest.visit_start).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>

<td>
  {guest.visit_end ? (
    <>
      <div>{moment(guest.visit_end).format("YYYY/MM/DD")}</div>
      <div>
        {moment(guest.visit_end).format("hh:mm")}
        <span>
          {moment(guest.visit_end).format("a") === "am" ? " ص" : " م"}
        </span>
      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>
                <td>{guest.reason ? guest.reason : "لا يوجد"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Pagination Controls */}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <Button
          onClick={handlePrevPage}
          disabled={guests.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={guests.page === guests.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default SecurityGuests;
