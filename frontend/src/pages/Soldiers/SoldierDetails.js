import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './SoldierDetails.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from "moment"

const SoldierDetails = () => {
    const auth = getAuthUser()
  let {id} = useParams();
  const [soldier, setSoldiers] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setSoldiers({ ...soldier,loading : true});
      axios.get('http://localhost:4001/soldier/' + id, {
          headers: {
        token: auth.token
    }})
      .then(resp => {
        setSoldiers({...soldier, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setSoldiers({
          ...soldier,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [soldier.reload]);



  return (
    <div className="officer-details-container">
      {soldier.err && (
        <Alert variant="danger" className="p-2">
          {soldier.err}
        </Alert>
      )}
      {soldier.success && (
        <Alert variant="success" className="p-2">
          {soldier.success}
        </Alert>
      )}

      {/* Full-width officer details */}
      <div className="officer-details-section">
        <h1>{soldier.results._name}</h1>
        <p className="officer-rank">{soldier.results._rank}</p>

        {/* Table for officer details */}
        <div className="table-responsive">
          <table className="officer-details-table">
            <tbody>
              <tr>
                <td><strong>الرقم العسكري:</strong></td>
                <td>{soldier.results._mil_id}</td>
              </tr>

              <tr>
                <td><strong>الدرجة:</strong></td>
                <td>{soldier.results._rank}</td>
              </tr>
              <tr>
                <td><strong>الاسم:</strong></td>
                <td>{soldier.results._name}</td>
              </tr>
              <tr>
                <td><strong>الورشة / الفرع:</strong></td>
                <td>{soldier.results._department}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الضم:</strong></td>
                <td>{moment(soldier.results._join_date).format('YYYY-MM-DD')}</td>
              </tr>

              <tr>
                <td><strong>تاريخ التسريح:</strong></td>
                <td>{moment(soldier.results._end_date).format('YYYY-MM-DD')}</td>
              </tr>

              <tr>
                <td><strong>رقم الهاتف:</strong></td>
                <td>{soldier.results._telephone_number ? soldier.results._telephone_number : "لا يوجد" }</td>
              </tr>

              <tr>
                <td><strong>اسم ولي الأمر:</strong></td>
                <td>{soldier.results._guardian_name ? soldier.results._guardian_name : "لا يوجد" }</td>
              </tr>

              <tr>
                <td><strong>رقم هاتف ولي الأمر:</strong></td>
                <td>{soldier.results._guardian_telephone_number ? soldier.results._guardian_telephone_number : "لا يوجد"}</td>
              </tr>

              {/* <tr>
                <td><strong>العنوان:</strong></td>
                <td>{soldier.results._address ? soldier.results._address : "لا يوجد"}</td>
              </tr> */}
              {/* <tr>
                <td><strong>الوزن:</strong></td>
                <td>{soldier.results._weight} كجم</td>
              </tr>
              <tr>
                <td><strong>الطول:</strong></td>
                <td>{soldier.results._height} سم</td>
              </tr>
              <tr>
                <td><strong>تاريخ الميلاد:</strong></td>
                <td>{moment(soldier.results._dob).format('YYYY-MM-DD')}</td>
              </tr> */}
              <tr>
                <td><strong>التمام:</strong></td>
                <td>{soldier.results._in_unit ? 'متواجد' : 'غير موجود'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SoldierDetails;