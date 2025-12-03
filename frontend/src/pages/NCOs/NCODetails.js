import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './NCODetails.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from "moment"

const NCODetails = () => {
    const auth = getAuthUser()
  let {id} = useParams();
  const [nco, setNCOs] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setNCOs({ ...nco,loading : true});
      axios.get('http://192.168.1.3:4001/nco/' + id, {
          headers: {
        token: auth.token
    }})
      .then(resp => {
        setNCOs({...nco, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setNCOs({
          ...nco,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [nco.reload]);


 return (
    <div className="officer-details-container">
      {nco.err && (
        <Alert variant="danger" className="p-2">
          {nco.err}
        </Alert>
      )}
      {nco.success && (
        <Alert variant="success" className="p-2">
          {nco.success}
        </Alert>
      )}

      {/* Full-width officer details */}
      <div className="officer-details-section">
        <h1>{nco.results._name}</h1>
        <p className="officer-rank">{nco.results._rank}</p>

        {/* Table for officer details */}
        <div className="table-responsive">
          <table className="officer-details-table">
            <tbody>
              <tr>
                <td><strong>الرقم العسكري:</strong></td>
                <td>{nco.results._mil_id}</td>
              </tr>
              <tr>
                <td><strong>الدرجة:</strong></td>
                <td>{nco.results._rank}</td>
              </tr>
              <tr>
                <td><strong>الاسم:</strong></td>
                <td>{nco.results._name}</td>
              </tr>
              <tr>
                <td><strong>الورشة / الفرع:</strong></td>
                <td>{nco.results._department}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الضم:</strong></td>
                <td>{moment(nco.results._join_date).format('YYYY-MM-DD')}</td>
              </tr>
              <tr>
                <td><strong>العنوان:</strong></td>
                <td>{nco.results._address ? nco.results._address : "لا يوجد"}</td>
              </tr>
              <tr>
                <td><strong>الوزن:</strong></td>
                <td>{nco.results._weight ? nco.results._weight + " كجم" : "لا يوجد"} </td>
              </tr>
              <tr>
                <td><strong>الطول:</strong></td>
                <td>{nco.results._height ? nco.results._height + " سم" : "لا يوجد"}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الميلاد:</strong></td>
                <td>{moment(nco.results._dob).format('YYYY-MM-DD') ? moment(nco.results._dob).format('YYYY-MM-DD') : "لا يوجد"}</td>
              </tr>
              <tr>
                <td><strong>التمام:</strong></td>
                <td>{nco.results._in_unit ? 'متواجد' : 'غير موجود'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NCODetails;