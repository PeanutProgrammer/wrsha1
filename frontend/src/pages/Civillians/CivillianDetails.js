import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './CivillianDetails.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from "moment"

const CivillianDetails = () => {
    const auth = getAuthUser()
  let {id} = useParams();
  const [civillian, setCivillians] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setCivillians({ ...civillian,loading : true});
      axios.get('http://192.168.1.3:4001/civillian/' + id, {
          headers: {
        token: auth.token
    }})
      .then(resp => {
        setCivillians({...civillian, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setCivillians({
          ...civillian,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [civillian.reload]);


  console.log(civillian.results);
  



  return (
    <div className="officer-details-container">
      {civillian.err && (
        <Alert variant="danger" className="p-2">
          {civillian.err}
        </Alert>
      )}
      {civillian.success && (
        <Alert variant="success" className="p-2">
          {civillian.success}
        </Alert>
      )}

      {/* Full-width officer details */}
      <div className="officer-details-section">
        <h1>{civillian.results._name}</h1>
        <p className="officer-rank">{civillian.results._rank}</p>

        {/* Table for officer details */}
        <div className="table-responsive">
          <table className="officer-details-table">
            <tbody>
              <tr>
                <td><strong>الرقم القومي:</strong></td>
                <td>{civillian.results._nationalID}</td>
              </tr>

              <tr>
                <td><strong>الاسم:</strong></td>
                <td>{civillian.results._name}</td>
              </tr>
              <tr>
                <td><strong>الورشة / الفرع:</strong></td>
                <td>{civillian.results._department}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الضم:</strong></td>
                <td>{moment(civillian.results._join_date).format('YYYY-MM-DD')}</td>
              </tr>
              <tr>
                <td><strong>العنوان:</strong></td>
                <td>{civillian.results._address ? civillian.results._address : "لا يوجد"}</td>
              </tr>
              <tr>
                <td><strong>رقم التيلفون:</strong></td>
                <td>{civillian.results._telephone_number}</td>
              </tr>
              <tr>
                <td><strong>تاريخ الميلاد:</strong></td>
                <td>{moment(civillian.results._dob).format('YYYY-MM-DD')}</td>
              </tr>
              <tr>
                <td><strong>التمام:</strong></td>
                <td>{civillian.results._in_unit ? 'متواجد' : 'غير موجود'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CivillianDetails;