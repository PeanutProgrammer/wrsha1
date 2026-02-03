import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getAuthUser } from "../../helper/Storage";

const OfficerDutyViewer = () => {
  const auth = getAuthUser();

  const [date, setDate] = useState(moment().locale("en").format("YYYY-MM-DD"));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Update arrows
  const changeDay = (amount) => {
    if (!date) return; // safety guard
    const newDate = moment(date)
      .add(amount, "days")
      .locale("en")
      .format("YYYY-MM-DD");
    console.log("Date before change:", date);
    console.log("Changing by:", amount, "days → new date:", newDate);
    setDate(newDate);
  };

  useEffect(() => {
    setLoading(true);
    setErr(null);
    setData(null); // 👈 clear previous state immediately

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/officerDuty/view-duty?date=${date}`,
        { headers: { token: auth.token } }
      )
      .then((res) => {
        setData(res.data.data || []);
      })
      .catch(() => {
        setErr("لا توجد نوبتجية مسجلة لهذا اليوم");
        setData([]); // 👈 ensure empty state
      })
      .finally(() => setLoading(false));
  }, [date]);
  useEffect(() => {
    if (!showHistory) return;

    setLoading(true);
    setErr(null);

    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officerDuty/`, {
        headers: { token: auth.token },
        params: {
          page,
          limit: 10,
          search: search || undefined,
        },
      })
      .then((res) => {
        setHistory(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          // No results found
          setHistory([]); // <-- important
          setTotalPages(1);
        } else {
          setErr("حدث خطأ في جلب البيانات");
        }
      })
      .finally(() => setLoading(false));
  }, [showHistory, page, search]);

  const duty = data?.[0];

  const mappedDuty = duty && {
  commander: {
    rank: duty.commander_rank,
    name: duty.commander_name,
    department: duty.commander_department,
    telephone_number: duty.commander_telephone_number,
  },
  operations: {
    rank: duty.operations_rank,
    name: duty.operations_name,
    department: duty.operations_department,
    telephone_number: duty.operations_telephone_number,
  },
  duty: {
    rank: duty.duty_rank,
    name: duty.duty_name,
    department: duty.duty_department,
    telephone_number: duty.duty_telephone_number,
  },
  lightweight: {
    rank: duty.lightweight_rank,
    name: duty.lightweight_name,
    department: duty.lightweight_department,
    telephone_number: duty.lightweight_telephone_number,
  },
  food: {
    rank: duty.food_rank,
    name: duty.food_name,
    department: duty.food_department,
    telephone_number: duty.food_telephone_number,
  },
};


 const Row = ({ label, officer }) => {
  const hasData =
    officer && (officer.rank || officer.name || officer.department);

  return (
    <div className="duty-view-row">
      <span className="duty-view-label">{label}</span>

      {hasData ? (
        <div className="duty-view-value">
          <div className="duty-officer-main">
            <span className="duty-rank">{`${officer.rank} \ `}</span>
            <span className="duty-name">{officer.name}</span>
          </div>

          {officer.department && (
            <div className="duty-view-dept">{officer.department}</div>
          )}

          {officer.telephone_number && (
            <div className="duty-phone">
              📞 <span>{officer.telephone_number}</span>
            </div>
          )}
        </div>
      ) : (
        <span className="duty-view-empty">—</span>
      )}
    </div>
  );
};


  return (
    <div className="duty-view-page">
      <div className="duty-toggle">
        <button
          className={`duty-toggle-btn ${showHistory ? "active" : ""}`}
          onClick={() => setShowHistory((prev) => !prev)}
        >
          {showHistory ? "عرض نوبتجية اليوم" : "سجل نوبتجية الضباط"}
        </button>
      </div>
      {/* Header */}
      <div className="duty-header">
        <div className="duty-header-title">
          <span className="duty-header-icon">📋</span>
          <h2>نوبتجية الضباط</h2>
        </div>

        <div className="duty-header-controls">
          <button
            className="duty-date-btn"
            onClick={() => changeDay(-1)}
            type="button"
            aria-label="اليوم السابق"
          >
            <FaChevronRight />
          </button>

          <input
            type="date"
            className="duty-date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            className="duty-date-btn"
            onClick={() => changeDay(1)}
            type="button"
            aria-label="اليوم التالي"
          >
            <FaChevronLeft />
          </button>
        </div>
      </div>

      {loading && <div className="duty-view-loading">جاري التحميل...</div>}
      {err && <div className="duty-view-error">{err}</div>}

      <div className={`duty-view-switch ${showHistory ? "history" : "card"}`}>
        {!showHistory && data?.length > 0 && (
          <div className="duty-view-card">
            <Row label="قائد منوب" officer={mappedDuty.commander} />
            <Row label="منوب عمليات" officer={mappedDuty.operations} />
            <Row label="ضابط نوبتجي" officer={mappedDuty.duty} />
            <Row label="ضابط خفيف حركة" officer={mappedDuty.lightweight} />
            <Row label="ضابط تعيين" officer={mappedDuty.food} />
          </div>
        )}

        {showHistory && (
          <div className="duty-history-card">
            <div className="duty-history-toolbar">
              <input
                type="text"
                placeholder="بحث بالاسم، الرتبة، القسم أو التاريخ..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // reset pagination on search
                }}
                className="duty-history-search"
              />
            </div>

            <table className="duty-history-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>قائد منوب</th>
                  <th>منوب عمليات</th>
                  <th>نوبتجي</th>
                  <th>خفيف حركة</th>
                  <th>تعيين</th>
                </tr>
              </thead>
              <tbody >
                {history.length > 0 ? (
                  history.map((row, idx) => {
                    const isToday =
                      moment(row.date).format("YYYY-MM-DD") ===
                      moment().format("YYYY-MM-DD");

                    return (
                      <tr key={idx} className={isToday ? "duty-today-row" : ""}>
                        <td>{moment(row.date).format("YYYY/MM/DD")}</td>
                        <td>
                          {row.commander_rank} / {row.commander_name}
                        </td>
                        <td>
                          {row.operations_rank} / {row.operations_name}
                        </td>
                        <td>
                          {row.duty_rank} / {row.duty_name}
                        </td>
                        <td>
                          {row.lightweight_rank} / {row.lightweight_name}
                        </td>
                        <td>
                          {row.food_rank} / {row.food_name}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        color: "#fff",
                        padding: "20px",
                      }}
                    >
                      لا توجد سجلات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="duty-pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  السابق
                </button>

                <span>
                  صفحة {page} من {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerDutyViewer;
