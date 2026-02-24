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

const LeaderSoldiers = () => {
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
    limit: 0,
    tempSearch: "",
  });
const [dailySummary, setDailySummary] = useState({
    total: 0,
    available: 0,
    missing: 0,
    تمام_الخوارج: {
      مأمورية_ثابتة: 0,
      فرقة_دورة: 0,
      راحة: 0,
      بدل_راحة: 0,
      عارضة: 0,
      اجازة_ميدانية: 0,
      منحة: 0,
      اجازة_سنوية: 0,
      اجازة_مرضية: 0,
      سفر: 0,
      مأمورية: 0,
      مستشفى: 0,
    },
    اجمالي_الخوارج: 0,
    percentageAvailable: 0,
  });




  // Fetch soldiers data and summary from the backend
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_BACKEND_BASE_URL}`); // backend port

    const fetchData = () => {
      const searchValue = soldiers.search.trim();
      const limit = 15;
      
      // Fetch soldiers with search filter and pagination
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/tmam?page=${soldiers.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setSoldiers({
            ...soldiers,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setSoldiers({
            ...soldiers,
            loading: false,
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong while fetching data.",
          });
        });

      // Fetch daily summary
      axios
        .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/soldier/daily-summary`, {
          headers: { token: auth.token },
        })
        .then((response) => {
          setDailySummary(response.data);
        })
        .catch((err) => {
          console.error("Error fetching daily summary", err);
        });
    };

    fetchData(); // Initial fetch on component mount

    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket:", socket.id);
    });

    socket.on("soldiersUpdated", () => {
      console.log("📢 soldiers updated — refetching data...");
      fetchData(); // Re-fetch on update
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

  const sortedOfficers = [...soldiers.results].sort((a, b) => {
    if (!sortConfig.key) return 0; // no sorting yet
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    return 0;
  });

  return (
    <div className="Officers p-5">
       {/* Header */}
      <div className="header d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h3 className="text-white"> تمام الجنود </h3>

        {/* Search bar */}
        <Form
          className="d-flex align-items-center flex-grow-1"
          onSubmit={handleSearchSubmit}
        >
          <InputGroup className="w-50 shadow-sm me-5">
            <Form.Control
              size="sm"
              placeholder="بحث 🔍"
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

            <Link to="../soldier-view">
      <Button
        size="md"
        variant="primary"
        className="px-3"
      >
        بيانات الجنود
      </Button>
    </Link>
      </div>

       <div className="daily-summary mt-4">
        <Table striped bordered hover size="sm">
          <thead className="table-dark">
            <tr className='table-summary-subheader'>
              <th colSpan="2">الإجمالي</th>
              <th colSpan="5" className="table-summary-header">تمام الخوارج</th>
              <th rowSpan={2}>اجمالي الخوارج</th>
              <th rowSpan={2}>موجود</th>
              <th rowSpan={2}>نسبة الخوارج</th>
            </tr>
            <tr className='table-summary-subheader'>
              <th>القوة</th>
              <th>الملاحق</th>
              <th>مأمورية ثابتة</th>
              <th>اجازة عادية</th>
              <th>اجازة مرضية</th>
              <th>مأمورية</th>
              <th>مستشفى</th>

            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{dailySummary.total}</td>
              <td>{dailySummary.attached}</td>
              <td>{dailySummary?.تمام_الخوارج?.مأمورية_ثابتة || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.راحة +  dailySummary?.تمام_الخوارج?.اجازة_ميدانية + dailySummary?.تمام_الخوارج?.منحة || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.اجازة_مرضية || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.مأمورية || 0}</td>
              <td>{dailySummary?.تمام_الخوارج?.مستشفى || 0}</td>
              <td>{dailySummary.missing}</td>
              <td>{dailySummary.available}</td>
              <td className="percentage-column">{dailySummary.percentageAvailable} %</td>
            </tr>
          </tbody>
        </Table>
      </div>


      {soldiers.err && (
        <Alert variant="danger" className="p-2">
          {soldiers.err}
        </Alert>
      )}
      {soldiers.success && (
        <Alert variant="success" className="p-2">
          {soldiers.success}
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
                الرتبة
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
                الورشة / الفرع
                {sortConfig.key === "department"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("in_unit")}>
                التمام
                {sortConfig.key === "in_unit"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("latest_arrival")}>اخر دخول
                {sortConfig.key === "latest_arrival"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th onClick={() => handleSort("latest_departure")}>اخر خروج
                {sortConfig.key === "latest_departure"
                  ? sortConfig.direction === "asc"
                    ? " 🔼"
                    : " 🔽"
                  : ""}
              </th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(soldiers.results) && soldiers.results.length > 0 ? (
              sortedOfficers.map((soldier, index) => (
                <tr key={soldier.mil_id}>
                  <td>{(soldiers.page - 1) * soldiers.limit + index + 1}</td>
                  <td>{soldier.mil_id}</td>
                  <td>{soldier.rank}</td>
                  <td>{soldier.name}</td>
                  <td>{soldier.department}</td>
                  <td
                  className={
                    soldier.in_unit
                      ? "bg-success text-white"
                      : "bg-danger text-white"
                  }
                >
                    {soldier.in_unit ? "متواجد" : "غير موجود"}
                    </td>
<td>
  {soldier.latest_arrival ? (
    <>
      <div>{moment(soldier.latest_arrival).format("YYYY/MM/DD")}</div>
      <div>
        {moment(soldier.latest_arrival).format("hh:mm a")}

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
        {moment(soldier.latest_departure).format("hh:mm a")}

      </div>
    </>
  ) : (
    "لا يوجد"
  )}
</td>
                  <td>{soldier.in_unit ? "لا يوجد" : soldier.tmam}</td>

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

export default LeaderSoldiers;
