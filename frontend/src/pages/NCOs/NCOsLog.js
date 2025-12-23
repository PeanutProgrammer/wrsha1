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

const NCOsLog = () => {
  const auth = getAuthUser()
  let {mil_id} = useParams();
  const [ncos, setNCOs] = useState({
    loading: true,
    err: null,
    results: [],
    page: 1,
    totalPages: 1,
    search: "",
    tempSearch: "",
  });

  const fetchNCOs = async () => {
    setNCOs((prev) => ({ ...prev, loading: true, results: [] }));
    try {
      const searchValue = toWesternDigits(ncos.search.trim());
      const resp = await axios.get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/NCOLog?page=${ncos.page}&limit=20&search=${searchValue}`,
        { headers: { token: auth.token } }
      );
      setNCOs((prev) => ({
        ...prev,
        results: resp.data.data || [],
        totalPages: resp.data.totalPages || 1,
        loading: false,
        err: null,
      }));
    } catch (err) {
      setNCOs((prev) => ({
        ...prev,
        loading: false,
        err: err.response
          ? JSON.stringify(err.response.data.errors)
          : "حدث خطأ أثناء تحميل البيانات.",
      }));
    }
  };

useEffect(() => {
    fetchNCOs();
  }, [ncos.page, ncos.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const normalized = toWesternDigits(ncos.tempSearch.trim());
    setNCOs((prev) => ({
      ...prev,
      search: normalized,
      page: 1,
      results: [],
    }));
  };

  const handleClearSearch = () => {
    setNCOs((prev) => ({
      ...prev,
      search: "",
      tempSearch: "",
      page: 1,
      results: [],
    }));
  };

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
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">إدارة تمام ضباط الصف</h3>
<Form onSubmit={handleSearchSubmit}>
          <InputGroup style={{ width: "220px" }}>
            <Form.Control
              size="sm"
              placeholder="بحث"
              value={ncos.tempSearch}
              onChange={(e) =>
                setNCOs((prev) => ({
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
            {ncos.tempSearch && (
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


      {ncos.err && (
        <Alert variant="danger" className="p-2">
          {ncos.err}
        </Alert>
      )}
      {ncos.success && (
        <Alert variant="success" className="p-2">
          {ncos.success}
        </Alert>
      )}


      <Table striped bordered hover responsive className="mb-0">
        <thead className='table-dark'>
          <tr>
            <th>م</th>
            <th>الرقم العسكري</th>
            <th>الدرجة</th>
            <th>الاسم</th>
            <th>الورشة / الفرع</th>
            <th>دخول / خروج</th>
            <th>الوقت</th>
            <th>السبب</th>
            <th>ملاحظات</th>

          </tr>
        </thead>
        <tbody>
          {Array.isArray(ncos.results) &&
          ncos.results.length > 0 ? (
            ncos.results.map((nco, index) => (
            <tr key={nco.mil_id}>
            <td>{index + 1}</td> {/* Arabic numbering, starting from 1 */}
            <td>{nco.mil_id}</td>    
            <td>{nco.rank}</td>
            <td>{nco.name}</td>
            <td>{nco.department}</td>
            <td>{nco.event_type? nco.event_type: "لا يوجد"}</td>
            <td>
  {nco.event_time
    ? new Date(nco.event_time).toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "لا يوجد"}
</td>

            <td>{(nco.event_type ? (nco.event_type == "دخول" ?
              `عودة ${nco.reason || ""}`
              : nco.reason) : "لا يوجد")}</td>            <td>{nco.notes? nco.notes: "لا يوجد"}</td>
 
              </tr>
            ))          ) : (
            <tr>
              <td colSpan="8" className="text-center">لا توجد بيانات</td>
            </tr>
          )}
        </tbody>
      </Table>
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

export default NCOsLog;


