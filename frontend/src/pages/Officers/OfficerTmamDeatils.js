import React, { useState, useEffect } from "react";
import "../../style/style.css";
import { Table, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getAuthUser } from "../../helper/Storage";
import moment from "moment";
moment.locale("ar-EG");

const OfficersTmamDetails = () => {
  const auth = getAuthUser();
  const { id } = useParams();

  const [state, setState] = useState({
    loading: true,
    err: null,
    results: [],
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }));

    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/Officer/tmam/${id}`, {
        headers: { token: auth.token },
      })
      .then((resp) => {
        setState({
          loading: false,
          err: null,
          results: resp.data.data || [],
        });
      })
      .catch((err) => {
        setState({
          loading: false,
          err: err.response
            ? err.response.data.message || "حدث خطأ"
            : "Something went wrong",
          results: [],
        });
      });
  }, [id]);

  if (state.loading) {
    return <div className="text-center p-5">جاري التحميل...</div>;
  }

  const records = state.results;
  const hasData = records.length > 0;
  const basicInfo = hasData ? records[0] : null;

  return (
    <div className="Officers p-5">
      <div className="header mb-4">
        <h3 className="text-center">سجل التمام (شئون)</h3>
      </div>

      {state.err && (
        <Alert variant="danger" className="p-2 text-center">
          {state.err}
        </Alert>
      )}

      {basicInfo && (
        <div className="mb-4 border p-3 rounded bg-light text-end" dir="rtl">
          <h5 className="mb-3">معلومات الضابط</h5>
          <p>
            <strong>الاسم:</strong> {basicInfo.name}
          </p>
          <p>
            <strong>الرتبة:</strong> {basicInfo.rank}
          </p>
          <p>
            <strong>الرقم العسكري:</strong> {basicInfo.mil_id}
          </p>
          <p>
            <strong>الفرع / الورشة:</strong> {basicInfo.department}
          </p>
        </div>
      )}

      <h5 className="mb-3">التمامات السابقة</h5>

      <Table striped bordered hover className="mb-0">
        <thead className="table-dark">
          <tr>
            <th>م</th>
            <th>نوع التمام</th>
            <th>الوجهة</th>
            <th>المدة</th>
            <th>من</th>
            <th>إلى</th>
            <th>الرصيد</th>
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            records.map((rec, index) => (
              <tr key={rec.tmam_id}>
                <td>{index + 1}</td>
                <td>{rec.tmam}</td>
                <td>{rec.destination || "—"}</td>
                <td>{rec.duration || "—"}</td>
                <td>{moment(rec.start_date).format("YYYY/MM/DD")}</td>
                <td>{rec.end_date ? moment(rec.end_date).format("YYYY/MM/DD") : "لا يوجد"}</td>
                <td>{rec.remaining ?? "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                لا يوجد تمامات سابقة
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OfficersTmamDetails;
