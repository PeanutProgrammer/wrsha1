import React, { useState, useEffect } from "react";
import "../../style/card.css";
import OfficerCard from "./components/NCOCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchNCOs = () => {
  const auth = getAuthUser();

  const [ncos, setNCOs] = useState({
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
  const [recordsPerPage] = useState(8);

  useEffect(() => {
    setNCOs({ ...ncos, loading: true });

    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/nco/filter/`, {
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
        setNCOs({
          ...ncos,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setNCOs({
            ...ncos,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setNCOs({
            ...ncos,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ncos.reload]);

  // ✅ Fetch departments
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/department/`, {
        headers: { token: auth.token },
      })
      .then((resp) => setDept(resp.data))
      .catch((err) => console.log(err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setNCOs({ ...ncos, reload: ncos.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = ncos.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(ncos.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-officers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن ضباط الصف</h2>

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
            <label>الدرجة</label>
            <select
              value={filters.rank}
              onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
            >
            <option value="">إختر درجة ضابط الصف</option>
            <option value="عريف">عريف</option>
            <option value="رقيب">رقيب</option>
            <option value="رقيب أول">رقيب أول</option> 
            <option value="مساعد">مساعد</option> 
            <option value="مساعد أول">مساعد أول</option> 
            <option value="صانع ماهر">صانع ماهر</option> 
              <option value="صانع دقيق">صانع دقيق</option> 
            <option value="صانع ممتاز">صانع ممتاز</option>
            <option value="ملاحظ">ملاحظ</option> 
            <option value="ملاحظ فني">ملاحظ فني</option>
            </select>
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
      {ncos.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {ncos.err && !ncos.loading && (
        <div className="alert-error">{ncos.err}</div>
      )}

      {/* Results */}
      {!ncos.loading && !ncos.err && (
        <div className="officer-list">
          {ncos.results.length === 0 ? (
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

export default SearchNCOs;
