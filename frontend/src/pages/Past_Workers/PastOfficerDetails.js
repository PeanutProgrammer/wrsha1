import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import './PastOfficerDetails.css';  // Use the updated specific CSS file
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from 'moment';

const PastOfficerDetails = () => {
  const auth = getAuthUser();
  let { id } = useParams();
  const [officer, setOfficers] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });

  useEffect(() => {
    setOfficers({ ...officer, loading: true });
    axios
      .get(`${process.env.REACT_APP_BACKEND_BASE_URL}/pastOfficer/` + id, {
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
          err:
            err.response
              ? JSON.stringify(err.response.data.errors)
              : 'حدث خطأ. يرجى المحاولة مرة أخرى في وقت لاحق.',
        });
      });
  }, [officer.reload]);

  return (
    <div className="officer-details-container">
      {officer.err && (
        <Alert variant="danger" className="p-2">
          {officer.err}
        </Alert>
      )}
      {officer.success && (
        <Alert variant="success" className="p-2">
          {officer.success}
        </Alert>
      )}

      {/* Full-width officer details */}
      <div className="officer-details-section">
        <h1>{officer.results._name}</h1>
        <p className="officer-rank">{officer.results._rank}</p>

        {/* Table for officer details */}
        <div className="table-responsive">
          <table className="officer-details-table">
            <tbody>
              <tr>
                <td><strong>الرقم العسكري:</strong></td>
                <td>{officer.results._mil_id}</td>
              </tr>
              <tr>
                <td><strong>رقم الأقدمية:</strong></td>
                <td>{officer.results._seniority_number}</td>
              </tr>
              <tr>
                <td><strong>الرتبة:</strong></td>
                <td>{officer.results._rank}</td>
              </tr>
              <tr>
                <td><strong>الاسم:</strong></td>
                <td>{officer.results._name}</td>
              </tr>
              {/* <tr>
                <td><strong>الورشة / الفرع:</strong></td>
                <td>{officer.results._department}</td>
              </tr> */}

              <tr>
                <td><strong>العنوان:</strong></td>
                <td>{officer.results._address ? officer.results._address : "لا يوجد"}</td>
              </tr>
              <tr>
                <td><strong>الوزن:</strong></td>
                <td>{officer.results._weight} كجم</td>
              </tr>
              <tr>
                <td><strong>الطول:</strong></td>
                <td>{officer.results._height} سم</td>
              </tr>
              <tr>
                <td><strong>تاريخ الميلاد:</strong></td>
                <td>{moment(officer.results._dob).format('YYYY/MM/DD')}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الضم:</strong></td>
                <td>{moment(officer.results._join_date).format('YYYY/MM/DD')}</td>
              </tr>
              <tr>
                <td><strong>تاريخ النقل:</strong></td>
                <td>{moment(officer.results._end_date).format('YYYY/MM/DD')}</td>
              </tr>
              <tr>
                <td><strong>النقل إلى:</strong></td>
                <td>{officer.results._transferred_to}</td>
              </tr>
              <tr>
                <td><strong>رقم بند أوامر النقل:</strong></td>
                <td>{officer.results._transferID}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PastOfficerDetails;
