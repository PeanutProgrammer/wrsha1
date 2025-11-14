import React, { useState, useEffect } from "react";
import "./SearchOfficers.css";
import OfficerCard from "./components/OfficerCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchOfficers = () => {
  const auth = getAuthUser();

  const [officers, setOfficers] = useState({
    loading: true,
    results: [],
    err: null,
    reload: 0,
  });

  const [dept, setDept] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    mil_id: "",
    name: "",
    rank: "",
    department: "",
  });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);

  useEffect(() => {
    setOfficers({ ...officers, loading: true });

    axios
      .get("http://localhost:4001/Officer/filter/", {
        headers: { token: auth.token },
        params: {
          search: filters.search,
          mil_id: filters.mil_id,
          name: filters.name,
          rank: filters.rank,
          department: filters.department,
        },
      })
      .then((resp) => {
        setOfficers({
          ...officers,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setOfficers({
            ...officers,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setOfficers({
            ...officers,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [officers.reload]);

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
    setOfficers({ ...officers, reload: officers.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = officers.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(officers.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-officers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن الضباط</h2>

        <form onSubmit={handleSearch} className="filter-form">
          <div className="form-group">
            <label>الرقم العسكري</label>
            <input
              type="text"
              value={filters.mil_id}
              onChange={(e) => setFilters({ ...filters, mil_id: e.target.value })}
              placeholder="ادخل الرقم العسكري"
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
            <label>الرتبة</label>
            <select
              value={filters.rank}
              onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
            >
              <option value="">إختر رتبة الضابط</option>
              <option value="ملازم">ملازم</option>
              <option value="ملازم أول">ملازم أول</option>
              <option value="نقيب">نقيب</option>
              <option value="نقيب أ ح">نقيب أ ح</option>
              <option value="رائد">رائد</option>
              <option value="رائد أ ح">رائد أ ح</option>
              <option value="مقدم">مقدم</option>
              <option value="مقدم أ ح">مقدم أ ح</option>
              <option value="عقيد">عقيد</option>
              <option value="عقيد أ ح">عقيد أ ح</option>
              <option value="عميد">عميد</option>
              <option value="عميد أ ح">عميد أ ح</option>
              <option value="لواء">لواء</option>
              <option value="لواء أ ح">لواء أ ح</option>
              <option value="فريق">فريق</option>
              <option value="فريق أول">فريق أول</option>
              <option value="مشير">مشير</option>
            </select>
          </div>

          <div className="form-group">
            <label  >الورشة / الفرع</label>
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
      {officers.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {officers.err && !officers.loading && (
        <div className="alert-error">{officers.err}</div>
      )}

      {/* Results */}
      {!officers.loading && !officers.err && (
        <div className="officer-list">
          {officers.results.length === 0 ? (
            <p className="no-results">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <div className="officer-grid">
                {currentRecords.map((officer) => (
                  <OfficerCard key={officer.id} {...officer} />
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

export default SearchOfficers;
