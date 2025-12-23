import React, { useState, useEffect } from "react";
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

const CivilliansTmam = () => {
  const auth = getAuthUser();
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [civillians, setCivillians] = useState({
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
      const searchValue = toWesternDigits(civillians.search.trim());
      const limit = 15;
      const resp = axios
        .get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/civillian/tmam?page=${civillians.page}&limit=${limit}&search=${searchValue}`,
          {
            headers: { token: auth.token },
          }
        )
        .then((resp) => {
          setCivillians({
            ...civillians,
            results: resp.data.data || [],
            totalPages: resp.data.totalPages || 1,
            limit: resp.data.limit || limit,
            loading: false,
            err: null,
          });
        })
        .catch((err) => {
          setCivillians({
            ...civillians,
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

    socket.on("civilliansUpdated", () => {
      console.log("📢 Civillians updated — refetching data...");
      fetchData(); // ✅ Re-fetch on update
    });

    return () => socket.disconnect();
  }, [civillians.page, civillians.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(civillians.tempSearch.trim());
    setCivillians((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setCivillians((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

  const handlePrevPage = () => {
    if (civillians.page > 1)
      setCivillians((prev) => ({ ...prev, page: prev.page - 1 }));
  };

  const handleNextPage = () => {
    if (civillians.page < civillians.totalPages)
      setCivillians((prev) => ({ ...prev, page: prev.page + 1 }));
  };

  const handleJumpToPage = (number) => {
    if (number >= 1 && number <= civillians.totalPages) {
      setCivillians((prev) => ({ ...prev, page: number }));
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
    let start = Math.max(civillians.page - 2, 1);
    let end = Math.min(start + maxButtons - 1, civillians.totalPages);
    start = Math.max(end - maxButtons + 1, 1);

    for (let num = start; num <= end; num++) {
      pages.push(
        <Button
          key={num}
          onClick={() => handleJumpToPage(num)}
          variant={num === civillians.page ? "primary" : "outline-primary"}
          className="mx-1 btn-sm"
        >
          {num}
        </Button>
      );
    }
    return pages;
  };

  const sortedCivillians = [...civillians.results].sort((a, b) => {
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
         <h3>إدارة تمام المدنيين</h3>
         {/* Search bar */}
         <Form
           className="d-flex align-items-center flex-grow-1"
           onSubmit={handleSearchSubmit}
         >
           <InputGroup className="w-50  shadow-sm me-5">
             <Form.Control
               size="sm"
               placeholder="بحث 🔍"
               value={civillians.tempSearch}
               onChange={(e) =>
                 setCivillians((prev) => ({ ...prev, tempSearch: e.target.value }))
               }
             />
             {civillians.tempSearch && (
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
 
       {/* Loading Indicator */}
       {civillians.loading && (
         <div className="loading-spinner">
           <div className="spinner"></div>
           <p>جاري التحميل...</p>
         </div>
       )}
 
       {/* Error Message */}
       {civillians.err && (
         <Alert variant="danger" className="p-2 text-center">
           {civillians.err}
         </Alert>
       )}
       <div className="table-responsive shadow-sm rounded bg-white">
         <Table id="officer-table" striped bordered hover className="mb-0">
           <thead className="table-dark">
             <tr>
               <th>م</th>
               <th onClick={() => handleSort("nationalID")}>
                 {sortConfig.key === "nationalID"
                   ? sortConfig.direction === "asc"
                     ? "↑"
                     : "↓"
                   : ""}{" "}
                 الرقم القومي
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
             {Array.isArray(civillians.results) && civillians.results.length > 0 ? (
               sortedCivillians.map((civillian, index) => (
                 <tr key={civillian.nationalID}>
                   <td>{(civillians.page - 1) * civillians.limit + index + 1}</td>
                   <td>{civillian.nationalID}</td>
                   <td>{civillian.name}</td>
                   <td>{civillian.department}</td>
                   <td>
                     {civillian.in_unit
                       ? "متواجد"
                       : civillian.tmam
                       ? civillian.tmam
                       : "غير متواجد"}
                   </td>
                   <td>
                     {civillian.latest_arrival
                       ? moment(civillian.latest_arrival).format(
                           "YYYY-MM-DD HH:mm:ss"
                         )
                       : "لا يوجد"}
                   </td>
                   <td>
                     {civillian.latest_departure
                       ? moment(civillian.latest_departure).format(
                           "YYYY-MM-DD HH:mm:ss"
                         )
                       : "لا يوجد"}
                   </td>
                   <td>
                     {/* <button className="btn btn-sm btn-danger mx-1 p-2" onClick ={(e) =>  {deleteOfficer(officer.nationalID)}}>حذف</button> */}
 
                     <Link
                       to={`../tmam/details/${civillian.nationalID}`}
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
           disabled={civillians.page === 1}
           variant="secondary"
           size="sm"
         >
           السابق
         </Button>
         <div>{renderPageButtons()}</div>
         <Button
           onClick={handleNextPage}
           disabled={civillians.page === civillians.totalPages}
           variant="secondary"
           size="sm"
         >
           التالي
         </Button>
       </div>
     </div>
   );
 };
 

export default CivilliansTmam;


