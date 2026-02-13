import React, { useState, useEffect } from 'react';
import "../../style/style.css";
import { Table, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const NCOsTmamDetails = () => {
  const auth = getAuthUser();
  const { id } = useParams();

  const [nco, setNCOs] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });

  useEffect(() => {
    setNCOs({ ...nco, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/nco/tmam/${id}`, {
        headers: {
          token: auth.token,
        },
      })
      .then((resp) => {
        setNCOs({
          ...nco,
          results: resp.data.data,
          loading: false,
          err: null,
        });
      })
      .catch((err) => {
        setNCOs({
          ...nco,
          loading: false,
          err: err.response
            ? JSON.stringify(err.response.data.errors)
            : "Something went wrong. Please try again later.",
        });
      });
  }, [nco.reload]);

  if (nco.loading) {
    return <div className="text-center p-5">جاري التحميل...</div>;
  }

  const records = nco.results;
  const hasData = records.length > 0;
  const basicInfo = hasData ? records[0] : null;

  return (
    <div className="Officers p-5">
      <div className="header mb-4">
        <h3 className="text-center">تفاصيل تمام ضابط الصف</h3>
      </div>

      {nco.err && (
        <Alert variant="danger" className="p-2">
          {nco.err}
        </Alert>
      )}

      {basicInfo && (
        <div className="mb-4 border p-3 rounded bg-light text-end" dir="rtl">
          <h5 className="mb-3">معلومات ضابط الصف:</h5>
          <p>
            <strong>الاسم:</strong> {basicInfo.name}
          </p>
          <p>
            <strong>الدرجة:</strong> {basicInfo.rank}
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
      <Table striped bordered hover responsive className="mb-0">
         <thead className='table-dark'>
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
                                 <td>{moment(rec.end_date).format("YYYY/MM/DD")}</td>
                                 <td>{rec.remaining ?? "—"}</td>
                               </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        لا يوجد سجلات تمام.
                      </td>
                    </tr>
                  )}
                </tbody>
      </Table>
    </div>
  );
};

export default NCOsTmamDetails;
