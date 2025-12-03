import React, { useState, useEffect } from "react";
import "./SearchExperts.css";
import ExpertCard from "./components/ExpertCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchExperts = () => {
  const auth = getAuthUser();

  const [experts, setExperts] = useState({
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
    security_clearance_number: "",
    company_name: "",

  });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);

  useEffect(() => {
    setExperts({ ...experts, loading: true });

    axios
      .get("http://192.168.1.3:4001/expert/filter/", {
        headers: { token: auth.token },
        params: {
          search: filters.search,
          nationalID: filters.nationalID,
          name: filters.name,
          security_clearance_number: filters.security_clearance_number,
          company_name: filters.company_name,
        },
      })
      .then((resp) => {
        setExperts({
          ...experts,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setExperts({
            ...experts,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setExperts({
            ...experts,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experts.reload]);

  // ✅ Fetch departments
  useEffect(() => {
    axios
      .get("http://192.168.1.3:4001/department/", {
        headers: { token: auth.token },
      })
      .then((resp) => setDept(resp.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setExperts({ ...experts, reload: experts.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = experts.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(experts.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-officers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن الخبراء</h2>

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
            <label>رقم التصديق الأمني</label>
            <input
              type="text"
              value={filters.security_clearance_number}
              onChange={(e) => setFilters({ ...filters, security_clearance_number: e.target.value })}
              placeholder="ادخل رقم التصديق الأمني"
            />
          </div>

          <div className="form-group">
            <label>اسم الشركة</label>
            <input
              type="text"
              value={filters.company_name}
              onChange={(e) => setFilters({ ...filters, company_name: e.target.value })}
              placeholder="ادخل اسم الشركة"
            />
          </div>



          <button className="search-btn" type="submit">
            بحث
          </button>
        </form>
      </div>

      {/* Loading */}
      {experts.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {experts.err && !experts.loading && (
        <div className="alert-error">{experts.err}</div>
      )}

      {/* Results */}
      {!experts.loading && !experts.err && (
        <div className="officer-list">
          {experts.results.length === 0 ? (
            <p className="no-results">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <div className="officer-grid">
                {currentRecords.map((expert) => (
                  <ExpertCard key={expert.id} {...expert} />
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

export default SearchExperts;
