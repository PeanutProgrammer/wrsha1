import React, { useState, useEffect } from 'react';
import "../../style/style.css";
import { Table, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const OfficersTmamDetails = () => {
  const auth = getAuthUser();
  const { id } = useParams();

  const [officer, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });

  useEffect(() => {
    setOfficers({ ...officer, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/Officer/tmam/${id}`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setOfficers({
          ...officer,
          results: resp.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setOfficers({
          ...officer,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "Something went wrong. Please try again later.",
        });
      });
  }, [officer.reload]);

  if (officer.loading) {
    return <div className="text-center p-5">جاري التحميل...</div>;
  }

  const records = officer.results;
  const hasData = Array.isArray(records) && records.length > 0;
  const basicInfo = hasData ? records[0] : null;

  return (
    <div className="Officers p-5">
      <div className="header mb-4">
        <h3 className="text-center">تفاصيل تمام الضباط</h3>
      </div>

      {officer.err && (
        <Alert variant="danger" className="p-2">
          {officer.err}
        </Alert>
      )}

      {basicInfo && (
        <div className="mb-4 border p-3 rounded bg-light text-end" dir="rtl">
          <h5 className="mb-3">معلومات الضابط:</h5>
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

      <h5 className="mb-3">سجل التمام:</h5>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>نوع التمام</th>
            <th>إلى</th>
            <th>الفترة من</th>
            <th>الفترة إلى</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {hasData ? (
            records.map((rec, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  {rec.event_type === "دخول"
                    ? `عودة ${rec.tmam || ""}` // show "عودة" + leave type if exists
                    : rec.tmam || "متواجد"}{" "}
                </td>{" "}
                <td>{rec.destination || "—"}</td>
                <td>
                  {rec.start_date
                    ? moment(rec.start_date).format("YYYY-MM-DD")
                    : "—"}
                </td>
                <td>
                  {rec.end_date
                    ? moment(rec.end_date).format("YYYY-MM-DD")
                    : "—"}
                </td>
                <td>{rec.notes || "—"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                لا يوجد سجلات تمام.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default OfficersTmamDetails;
