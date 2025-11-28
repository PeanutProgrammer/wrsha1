import React, { useState, useEffect } from 'react';
import './Officers.css';
import { Table, Alert, Button, InputGroup, Form } from "react-bootstrap";
import { Link ,useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

// Helper: Convert Arabic-Indic digits to Western digits
const toWesternDigits = (str) => {
  return str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};
const OfficersLog = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [officers, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    page: 1,
    totalPages: 1,
    search: "",
    tempSearch: "",
  });

  const fetchOfficers = async () => {
    setOfficers((prev) => ({ ...prev, loading: true, results: [] }));
    try {
      const searchValue = toWesternDigits(officers.search.trim());
      const resp = await axios.get(
        `http://localhost:4001/OfficerLog?page=${officers.page}&limit=10&search=${searchValue}`,
        { headers: { token: auth.token } }
      );
      setOfficers((prev) => ({
        ...prev,
        results: resp.data.data || [],
        totalPages: resp.data.totalPages || 1,
        loading: false,
        err: null,
      }));
    } catch (err) {
      setOfficers((prev) => ({
        ...prev,
        loading: false,
        err: err.response
          ? JSON.stringify(err.response.data.errors)
          : "حدث خطأ أثناء تحميل البيانات.",
      }));
    }
  };

    useEffect(() => {
      fetchOfficers();
    }, [officers.page, officers.search]);
  
    const handleSearchSubmit = (e) => {
      e.preventDefault();
      const normalized = toWesternDigits(officers.tempSearch.trim());
      setOfficers((prev) => ({
        ...prev,
        search: normalized,
        page: 1,
        results: [],
      }));
    };
  
    const handleClearSearch = () => {
      setOfficers((prev) => ({
        ...prev,
        search: "",
        tempSearch: "",
        page: 1,
        results: [],
      }));
    };
  
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
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة تمام الضباط</h3>
<Form onSubmit={handleSearchSubmit}>
          <InputGroup style={{ width: "220px" }}>
            <Form.Control
              size="sm"
              placeholder="بحث"
              value={officers.tempSearch}
              onChange={(e) =>
                setOfficers((prev) => ({
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
            {officers.tempSearch && (
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


      {officers.err && (
        <Alert variant="danger" className="p-2">
          {officers.err}
        </Alert>
      )}
      {officers.success && (
        <Alert variant="success" className="p-2">
          {officers.success}
        </Alert>
      )}


      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الرقم العسكري</th>
            <th>الرتبة</th>
            <th>الإسم</th>
            <th>الورشة / الفرع</th>
            <th>دخول / خروج</th>
            <th>الوقت</th>
            <th>السبب</th>
            <th>ملاحظات</th>
            {/* <th>Action</th> */}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(officers.results) &&
          officers.results.length > 0 ? (
            officers.results.map((officer) => (
            <tr key={officer.mil_id}>
            <td>{officer.mil_id}</td>    
            <td>{officer.rank}</td>
            <td>{officer.name}</td>
            <td>{officer.department}</td>
            <td>{officer.event_type? officer.event_type: "لا يوجد"}</td>
            <td>
  {officer.event_time
    ? new Date(officer.event_time).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "لا يوجد"}
</td>

            <td>{(officer.event_type ? (officer.event_type == "دخول" ?
              `عودة ${officer.reason || ""}`
              : officer.reason) : "لا يوجد")}</td>
            <td>{officer.notes? officer.notes : "لا يوجد"}</td>

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

export default OfficersLog;


