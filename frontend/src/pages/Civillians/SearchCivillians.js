import React, { useState, useEffect } from "react";
import "./SearchCivillians.css";
import CivillianCard from "./components/CivillianCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchCivillians = () => {
  const auth = getAuthUser();

  const [civillians, setCivillians] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  const [dept, setDept] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    nationalID: "",
    name: "",
    department: "",
  });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);

  useEffect(() => {
    setCivillians({ ...civillians, loading: true });

    axios
      .get("http://localhost:4001/civillian/filter/", {
        headers: { token: auth.token },
        params: {
          search: filters.search,
          nationalID: filters.nationalID,
          name: filters.name,
          department: filters.department,
        },
      })
      .then((resp) => {
        setCivillians({
          ...civillians,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setCivillians({
            ...civillians,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setCivillians({
            ...civillians,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [civillians.reload]);

  // ✅ Fetch departments
  useEffect(() => {
    axios
      .get("http://localhost:4001/department/", {
        headers: { token: auth.token },
      })
      .then((resp) => setDept(resp.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCivillians({ ...civillians, reload: civillians.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = civillians.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(civillians.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-officers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن المدنيين</h2>

        <form onSubmit={handleSearch} className="filter-form">
          <div className="form-group">
            <label>الرقم القومي</label>
            <input
              type="text"
              value={filters.nationalID}
              onChange={(e) => setFilters({ ...filters, nationalID: e.target.value })}
              placeholder="ادخل الرقم القومي"
            />
          </div>

          <div className="form-group">
            <label>الاسم</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="ادخل الاسم"
            />
          </div>

          
          <div className="form-group">
            <label>الورشة / الفرع</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">إختر الورشة / الفرع</option>
              {dept.map((dep) => (
                <option key={dep.name} value={dep.name}>
                  {dep.name}
                </option>
              ))}
            </select>
          </div>

          <button className="search-btn" type="submit">
            بحث
          </button>
        </form>
      </div>

      {/* Loading */}
      {civillians.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {civillians.err && !civillians.loading && (
        <div className="alert-error">{civillians.err}</div>
      )}

      {/* Results */}
      {!civillians.loading && !civillians.err && (
        <div className="officer-list">
          {civillians.results.length === 0 ? (
            <p className="no-results">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <div className="officer-grid">
                {currentRecords.map((civillian) => (
                  <CivillianCard key={civillian.id} {...civillian} />
                ))}
              </div>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    className="btn btn-light"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </button>

                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      className={`btn btn-light page-btn ${
                        currentPage === number ? "active" : ""
                      }`}
                      onClick={() => paginate(number)}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    className="btn btn-light"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchCivillians;
