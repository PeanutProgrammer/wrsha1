import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { Form, Button, Alert, InputGroup, Spinner } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Select from "react-select";
import { getAuthUser } from "../../helper/Storage";

const OfficerDutyForm = () => {
  const auth = getAuthUser();

  // ---------------- State ----------------
  const [date, setDate] = useState(() =>
    moment().locale("en").format("YYYY-MM-DD")
  ); // ensure today's date on first render
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    available_officer: null,
    commander_officer: null,
    operations_officer: null,
    duty_officer: null,
    lightweight_officer: null,
    food_officer: null,
  });

  // ---------------- Helpers ----------------
  const officerOptions = officers.map((o) => ({
    value: o.id,
    label: `${o.rank} / ${o.name}`,
  }));

  const handleSelectChange = (field, option) => {
    setFormData((prev) => ({
      ...prev,
      [field]: option ? option.value : null,
    }));
  };

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

  const resetForm = () => {
    setFormData({
      available_officer: null,
      commander_officer: null,
      operations_officer: null,
      duty_officer: null,
      lightweight_officer: null,
      food_officer: null,
    });
    setIsEdit(false);
  };

  const getFilteredOptions = (currentKey) => {
    const {
      available_officer,
      commander_officer,
      operations_officer,
      duty_officer,
      lightweight_officer,
      food_officer,
    } = formData;

    const allSelections = {
      available_officer,
      commander_officer,
      operations_officer,
      duty_officer,
      lightweight_officer,
      food_officer,
    };

    return officerOptions.filter((opt) => {
      const selectedValues = Object.entries(allSelections)
        .filter(([key, val]) => val && key !== currentKey)
        .map(([_, val]) => val);

      const isSameAsAvailableCommander =
        (currentKey === "available_officer" &&
          opt.value === commander_officer) ||
        (currentKey === "commander_officer" && opt.value === available_officer);

      // ✅ allow available = commander
      if (isSameAsAvailableCommander) return true;

      // ❌ prevent using the same officer anywhere else
      if (selectedValues.includes(opt.value)) return false;

      return true;
    });
  };

  const isFormValid = () => {
    const {
      available_officer,
      commander_officer,
      operations_officer,
      duty_officer,
      lightweight_officer,
      food_officer,
    } = formData;

    // all required
    if (
      !available_officer ||
      !commander_officer ||
      !operations_officer ||
      !duty_officer ||
      !lightweight_officer ||
      !food_officer
    ) {
      return false;
    }

    const allValues = [
      available_officer,
      commander_officer,
      operations_officer,
      duty_officer,
      lightweight_officer,
      food_officer,
    ];

    const uniqueValues = new Set(allValues);

    // Case 1: all unique
    if (uniqueValues.size === 6) return true;

    // Case 2: ONLY available === commander, rest unique
    if (
      available_officer === commander_officer &&
      new Set([
        available_officer,
        operations_officer,
        duty_officer,
        lightweight_officer,
        food_officer,
      ]).size === 5
    ) {
      return true;
    }

    return false;
  };

  // ---------------- Fetch officers list ----------------
  useEffect(() => {
    console.log("Initial date on page load:", date);

    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/officer?limit=1000`, {
        headers: { token: auth.token },
      })
      .then((res) => setOfficers(res.data.data || []))
      .catch(() => setErr("فشل تحميل الضباط"));
  }, []);

  // ---------------- Fetch duty for selected date ----------------
  useEffect(() => {
    if (!date || officers.length === 0) return;

    setErr(null);
    setSuccess(null);

    axios
      .get(
        `${process.env.REACT_APP_BACKEND_BASE_URL}/officerDuty/date?date=${date}`,
        { headers: { token: auth.token } }
      )
      .then((res) => {
        if (res.data) {
          setFormData({
            available_officer: res.data.available_officer,
            commander_officer: res.data.commander_officer,
            operations_officer: res.data.operations_officer,
            duty_officer: res.data.duty_officer,
            lightweight_officer: res.data.lightweight_officer,
            food_officer: res.data.food_officer,
          });
          setIsEdit(true);
        } else {
          resetForm();
        }
      })
      .catch(() => resetForm());
  }, [date, officers]);

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setErr("يرجى اختيار جميع الضباط بدون تكرار");
      return;
    }

    setLoading(true);
    setErr(null);
    setSuccess(null);

    try {
      const payload = { ...formData, date };

      if (isEdit) {
        await axios.put(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officerDuty`,
          payload,
          { headers: { token: auth.token } }
        );
        setSuccess("تم تحديث النوبتجية بنجاح");
      } else {
        await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officerDuty`,
          payload,
          { headers: { token: auth.token } }
        );
        setSuccess("تم تسجيل النوبتجية بنجاح");
      }
    } catch {
      setErr("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="officer-duty-page">
      <h2 className="duty-page-title">
        {isEdit ? "✏️ تعديل نوبتجية الضباط" : "🗓️ تسجيل نوبتجية الضباط"}
      </h2>

      {/* Date Selector */}
      <div className="duty-date-selector">
        <button
          className="duty-date-btn"
          onClick={() => changeDay(-1)}
          type="button"
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
        >
          <FaChevronLeft />
        </button>
      </div>

      {/* Alerts */}
      {err && <div className="duty-alert duty-alert-error">{err}</div>}
      {success && (
        <div className="duty-alert duty-alert-success">{success}</div>
      )}

      {/* Form */}
      <form className="duty-form" onSubmit={handleSubmit}>
        {[
          ["available_officer", "تواجد بالوحدة"],
          ["commander_officer", "قائد منوب"],
          ["operations_officer", "منوب عمليات"],
          ["duty_officer", "ضابط نوبتجي"],
          ["lightweight_officer", "ضابط خفيف حركة"],
          ["food_officer", "ضابط تعيين"],
        ].map(([key, label]) => (
          <div className="duty-form-group" key={key}>
            <label className="duty-form-label">{label}</label>
            <div className="duty-form-select-container">
              <Select
                options={getFilteredOptions(key)}
                value={
                  officerOptions.find((o) => o.value === formData[key]) || null
                }
                onChange={(opt) => handleSelectChange(key, opt)}
                isClearable
                placeholder="اختر الضابط"
                classNamePrefix="duty-select"
                menuPortalTarget={document.body} // ensures the dropdown is rendered at body level
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "#1f2329",
                    borderColor: "#d4af37",
                    color: "#fff",
                    minHeight: "45px",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    color: "#ccc",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "#fff",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "#1f2329",
                    color: "#fff",
                    zIndex: 9999,
                  }),
                  menuList: (provided) => ({
                    ...provided,
                    backgroundColor: "#1f2329",
                    color: "#fff",
                    padding: 0,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? "#d4af37" : "#1f2329",
                    color: state.isFocused ? "#000" : "#fff",
                    cursor: "pointer",
                  }),
                  dropdownIndicator: (provided) => ({
                    ...provided,
                    color: "#d4af37",
                  }),
                  clearIndicator: (provided) => ({
                    ...provided,
                    color: "#d4af37",
                  }),
                }}
              />
            </div>
          </div>
        ))}

        <button type="submit" className="duty-submit-btn" disabled={loading}>
          {loading
            ? "جاري الحفظ..."
            : isEdit
            ? "تحديث النوبتجية"
            : "حفظ النوبتجية"}
        </button>
      </form>
    </div>
  );
};

export default OfficerDutyForm;
