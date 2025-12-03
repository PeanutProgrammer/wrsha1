import React, { useState, useEffect } from "react";
import "./SearchSoldiers.css";
import SoldierCard from "./components/SoldierCard";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const SearchSoldiers = () => {
  const auth = getAuthUser();

  const [soldiers, setSoldiers] = useState({
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
    setSoldiers({ ...soldiers, loading: true });

    axios
      .get("http://192.168.1.3:4001/soldier/filter/", {
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
        setSoldiers({
          ...soldiers,
          results: resp.data || [],
          loading: false,
          err: null,
        });
        setCurrentPage(1); // ✅ Reset to first page after each search
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setSoldiers({
            ...soldiers,
            results: [],
            loading: false,
            err: null,
          });
        } else {
          setSoldiers({
            ...soldiers,
            loading: false,
            err: err.response?.data?.msg || "حدث خطأ أثناء تحميل البيانات.",
          });
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soldiers.reload]);

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
    setSoldiers({ ...soldiers, reload: soldiers.reload + 1 });
  };

  // ✅ Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = soldiers.results.slice(indexOfFirstRecord, indexOfLastRecord);

  const totalPages = Math.ceil(soldiers.results.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="search-officers-page">
      <div className="search-box">
        <h2 className="search-title">بحث عن الجنود</h2>

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
            <option value="">إختر درجة الجندي </option>
            <option value="جندي">جندي</option>
            <option value="عريف مجند">عريف مجند</option>
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
      {soldiers.loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>جاري التحميل...</p>
        </div>
      )}

      {/* Error */}
      {soldiers.err && !soldiers.loading && (
        <div className="alert-error">{soldiers.err}</div>
      )}

      {/* Results */}
      {!soldiers.loading && !soldiers.err && (
        <div className="officer-list">
          {soldiers.results.length === 0 ? (
            <p className="no-results">لا توجد نتائج مطابقة للبحث</p>
          ) : (
            <>
              <div className="officer-grid">
                {currentRecords.map((soldier) => (
                  <SoldierCard key={soldier.id} {...soldier} />
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

export default SearchSoldiers;
