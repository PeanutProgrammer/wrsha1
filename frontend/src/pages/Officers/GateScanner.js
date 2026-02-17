import React, { useState } from "react";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";

const GateScanner = () => {
  const [value, setValue] = useState("");
  const [result, setResult] = useState(null);
  const auth = getAuthUser();

  const handleScan = async (e) => {
    if (e.key === "Enter") {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/officerLog/scan`,
          { qr_token: value,
            loggerID: auth.id
          },
          { headers: { token: auth.token } }
        );

        setResult({
          type: "success",
          officer: res.data.officer,
          event: res.data.event,
        });

        setValue("");
      } catch (err) {
        setResult({
          type: "error",
          message: err.response?.data?.msg || "حدث خطأ أثناء التسجيل",
        });

        setValue("");
      }
    }
  };

  return (
    <div className="gate-page">
      <div className="gate-card">

        <h1 className="gate-title">بوابة الدخول والخروج</h1>

        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleScan}
          className="gate-input"
          placeholder="قم بمسح الكود..."
        />

        {result && result.type === "success" && (
          <div className="gate-success animate-in">
            <h2>
              {result.event === "دخول" ? "أهلاً وسهلاً 👋" : "نتمنى لكم يومًا موفقًا 👋"}
            </h2>

            <div className="officer-name">
              {result.officer.rank} / {result.officer.name}
            </div>

            <div className="officer-dept">
              {result.officer.department}
            </div>

            <div className="gate-event-badge">
              تم تسجيل {result.event}
            </div>
          </div>
        )}

        {result && result.type === "error" && (
          <div className="gate-error animate-in">
            ❌ {result.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default GateScanner;
