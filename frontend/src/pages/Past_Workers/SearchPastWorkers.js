import React, { useState, useEffect } from "react";
import "../../style/card.css";
import PastWorkerCard from "./components/PastWorkerCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchPastWorkers = () => {
  const auth = getAuthUser();

  const [workers, setWorkers] = useState({
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
    end_date: "",
  });

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(6);

  useEffect(() => {
    setWorkers({ ...workers, loading: true });

    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/pastOfficer/filter`, {
        headers: { token: auth.token },
        params: {
          search: filters.search,
          mil_id: filters.mil_id,
          name: filters.name,
          rank: filters.rank,
          end_date: filters.end_date, // Include additional filters as needed
        },
      })
      .then((resp) => {
        setWorkers({
          ...workers,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setWorkers({
            ...workers,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setWorkers({
            ...workers,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workers.reload]);

 

  const handleSearch = (e) => {
    e.preventDefault();
    setWorkers({ ...workers, reload: workers.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = workers.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(workers.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-workers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن العاملين السابقين</h2>

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
            <label>الرتبة / الدرجة </label>
            <select
              value={filters.rank}
              onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
            >
              <option value="">إختر رتبة / درجة </option>
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
              {/* Add more ranks as needed */}
            </select>
          </div>

          <div className="form-group">
            <label>تاريخ التسريح</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          <button className="search-btn" type="submit">
            بحث
          </button>
        </form>
      </div>

      {/* Loading */}
      {workers.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {workers.err && !workers.loading && (
        <div className="alert-error">{workers.err}</div>
      )}

      {/* Results */}
      {!workers.loading && !workers.err && (
        <div className="officer-list">
          {workers.results.length === 0 ? (
            <p className="no-results">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <div className="officer-grid">
                {currentRecords.map((worker) => (
                  <PastWorkerCard key={worker.id} {...worker} />
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

export default SearchPastWorkers;
