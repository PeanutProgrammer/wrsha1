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

const SecurityExperts = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({
    key: "",
    direction: "asc",
  });
  const now = moment().format("YYYY/MM/DD HH:mm:ss");
  const [experts, setExperts] = useState({
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

  // ✅ Modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); //  backend port

    const fetchData = () => {
      const searchValue = toWesternDigits(experts.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/expert?page=${experts.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setExperts({
            ...experts,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setExperts({
            ...experts,
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

    socket.on("expertsUpdated", () => {
      console.log("📢 Experts updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [experts.page, experts.search]);

  // ✅ Show confirmation modal before deleting
  const handleDeleteClick = (expert) => {
    setSelectedExpert(expert);
    setShowConfirm(true);
  };

  // ✅ Delete confirmation
  const confirmDelete = () => {
    if (!selectedExpert) return;

    axios
      .delete(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/expert/` +
          selectedExpert.nationalID,
        {
          headers: {
            token: auth.token,
          },
        }
      )
      .then(() => {
        setShowConfirm(false);
        setSelectedExpert(null);

        // ✅ Show success message
        setExperts({
          ...experts,
          reload: experts.reload + 1,
          success: "تم حذف الخبير بنجاح ✅",
          err: null,
        });

        // ✅ Hide message after 3 seconds
        setTimeout(() => {
          setExperts((prev) => ({ ...prev, success: null }));
        }, 3000);
      })
      .catch((err) => {
        setExperts({
          ...experts,
          err: err.response?.data?.errors || "حدث خطأ أثناء محاولة حذف الخبير.",
        });
        setShowConfirm(false);
      });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(experts.tempSearch.trim());
    setExperts((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setExperts((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (experts.page > 1)
      setExperts((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (experts.page < experts.totalPages)
      setExperts((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= experts.totalPages) {
      setExperts((prev) => ({ ...prev, page: number }));
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
    let start = Math.max(experts.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, experts.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === experts.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedExperts = [...experts.results].sort((a, b) => {
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
        <h3 className="text-center mb-3">تمام الخبراء</h3>
        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50  shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
              value={experts.tempSearch}
              onChange={(e) =>
                setExperts((prev) => ({ ...prev, tempSearch: e.target.value }))
              }
            />
            {experts.tempSearch && (
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
      {experts.success && (
        <Alert variant="success" className="p-2 text-center">
          {experts.success}
        </Alert>
      )}

      {/* ❌ Error Message */}
      {experts.err && (
        <Alert variant="danger" className="p-2 text-center">
          {experts.err}
        </Alert>
      )}

      <div className="table-responsive">
        <Table striped bordered hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th>م</th>
              <th onClick={() => handleSort("nationalID")}>
                {sortConfig.key === "nationalID"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}{" "}
                رقم تحقيق الشخصية
              </th>
              <th onClick={() => handleSort("name")}>
                الاسم{" "}
                {sortConfig.key === "name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>

              {/* <th onClick={() => handleSort("valid_from")}>
                الفترة من
                {sortConfig.key === "valid_from"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("valid_through")}>
                الفترة إلى
                {sortConfig.key === "valid_through"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th> */}
              <th onClick={() => handleSort("department")}>
                مكان التواجد
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th>حالة التصديق</th>
              <th>التمام</th>
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
              {/* <th onClick={() => handleSort("company_name")}>
                اسم الشركة
                {sortConfig.key === "company_name"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th> */}

            </tr>
          </thead>
          <tbody>
            {Array.isArray(experts.results) && experts.results.length > 0 ? (
              sortedExperts.map((expert, index) => (
                <tr key={expert.nationalID}>
                  <td>{(experts.page - 1) * experts.limit + index + 1}</td>
                  <td>{expert.nationalID}</td>
                  <td>{expert.name}</td>
                  {/* <td>{moment(expert.valid_from).format("YYYY/MM/DD")}</td>
                <td>{moment(expert.valid_through).format("YYYY/MM/DD")}</td> */}
                  <td>{expert.department}</td>

                  <td
                    className={
                      moment(expert.valid_from).isBefore(now) &&
                      moment(expert.valid_through).isAfter(now)
                        ? "bg-success text-white" // Valid: green
                        : moment(expert.valid_through).isBefore(now)
                        ? "bg-danger text-white" // Expired: red
                        : moment(expert.valid_from).isAfter(now)
                        ? "bg-warning text-dark" // Not started yet: yellow
                        : "bg-danger text-white" // fallback
                    }
                  >
                    {" "}
                    {
                      moment(expert.valid_from).isBefore(now) &&
                      moment(expert.valid_through).isAfter(now)
                        ? "ساري"
                        : moment(expert.valid_through).isBefore(now)
                        ? "منتهي"
                        : moment(expert.valid_from).isAfter(now)
                        ? "لم يبدأ بعد" // Optional, if you want to display something for experts who haven't started yet
                        : "منتهي" // fallback for invalid state
                    }
                  </td>
                  <td
                    className={
                      expert.in_unit
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                    }
                  >
                    {expert.in_unit ? "متواجد" : "غير موجود"}
                  </td>

                  <td>
                    {expert.latest_arrival ? (
                      <>
                        <div>
                          {moment(expert.latest_arrival).format("YYYY/MM/DD")}
                        </div>
                        <div>
                          {moment(expert.latest_arrival).format("hh:mm a")}
 
                        </div>
                      </>
                    ) : (
                      "لا يوجد"
                    )}
                  </td>

                  <td>
                    {expert.latest_departure ? (
                      <>
                        <div>
                          {moment(expert.latest_departure).format("YYYY/MM/DD")}
                        </div>
                        <div>
                          {moment(expert.latest_departure).format("hh:mm a")}

                        </div>
                      </>
                    ) : (
                      "لا يوجد"
                    )}
                  </td>

                  {/* <td>{expert.company_name}</td> */}

                  
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
          disabled={experts.page === 1}
          variant="secondary"
          size="sm"
        >
          السابق
        </Button>
        <div>{renderPageButtons()}</div>
        <Button
          onClick={handleNextPage}
          disabled={experts.page === experts.totalPages}
          variant="secondary"
          size="sm"
        >
          التالي
        </Button>
      </div>
    </div>
  );
};

export default SecurityExperts;
