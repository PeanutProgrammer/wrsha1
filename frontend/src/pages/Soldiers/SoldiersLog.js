import React, { useState, useEffect } from 'react';
import "../../style/style.css";
import { Table, Alert, Button, InputGroup, Form } from "react-bootstrap";
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};
const SoldiersLog = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [soldiers, setSoldiers] = useState({
    loading: true,
    err: null,
    results: [],
    page: 1,
    totalPages: 1,
    search: "",
    tempSearch: "",
  });

   const fetchSoldiers = async () => {
     setSoldiers((prev) => ({ ...prev, loading: true, results: [] }));
     try {
       const searchValue = toWesternDigits(soldiers.search.trim());
       const resp = await axios.get(
         `${process.env.REACT_APP_BACKEND_BASE_URL}/SoldierLog?page=${soldiers.page}&limit=20&search=${searchValue}`,
         { headers: { token: auth.token } }
       );
       setSoldiers((prev) => ({
         ...prev,
         results: resp.data.data || [],
         totalPages: resp.data.totalPages || 1,
         loading: false,
         err: null,
       }));
     } catch (err) {
       setSoldiers((prev) => ({
         ...prev,
         loading: false,
         err: err.response
           ? JSON.stringify(err.response.data.errors)
           : "حدث خطأ أثناء تحميل البيانات.",
       }));
     }
   };

   useEffect(() => {
     fetchSoldiers();
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

  return (
    <div className="Officers p-5">
      <div className="header d-flex justify-content-between mb-3 align-items-center">
        <h3 className="text-center mb-3">إدارة تمام الجنود</h3>
 <Form onSubmit={handleSearchSubmit}>
          <InputGroup style={{ width: "220px" }}>
            <Form.Control
              size="sm"
              placeholder="بحث"
              value={soldiers.tempSearch}
              onChange={(e) =>
                setSoldiers((prev) => ({
                  ...prev,
                  tempSearch: e.target.value,
                }))
              }
            />
            <Button
              size="sm"
              variant="primary"
              onClick={handleSearchSubmit}
              className="p-1"
            >
              🔍
            </Button>
            {soldiers.tempSearch && (
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={handleClearSearch}
                className="p-1"
              >
                ×
              </Button>
            )}
          </InputGroup>
        </Form>
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


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الرقم العسكري</th>
            <th>الدرجة</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>دخول / خروج</th>
            <th>الوقت</th>
            <th>السبب</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(soldiers.results) &&
          soldiers.results.length > 0 ? (
            soldiers.results.map((soldier) => (
            <tr key={soldier.mil_id}>
            <td>{soldier.mil_id}</td>    
            <td>{soldier.rank}</td>
            <td>{soldier.name}</td>
            <td>{soldier.department}</td>
            <td>{soldier.event_type? soldier.event_type: "لا يوجد"}</td>
            <td>
  {soldier.event_time
    ? new Date(soldier.event_time).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "لا يوجد"}
</td>

            <td>{(soldier.event_type? (soldier.event_type == "دخول"? "دخول" : soldier.reason): "لا يوجد")}</td>
            <td>{soldier.notes? soldier.notes: "لا يوجد"}</td>

    
            </tr>
            ))
        ) : (
            <tr>
              <td colSpan="8" className="text-center">لا توجد بيانات</td>
            </tr>
          )}
        </tbody>
      </Table>
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

export default SoldiersLog;


