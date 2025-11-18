import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './ExpertDetails.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from "moment"

const ExpertDetails = () => {
    const auth = getAuthUser()
  let {id} = useParams();
  const [expert, setExperts] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setExperts({ ...expert,loading : true});
      axios.get('http://localhost:4001/expert/' + id, {
          headers: {
        token: auth.token
    }})
      .then(resp => {
        setExperts({...expert, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setExperts({
          ...expert,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [expert.reload]);


  console.log(expert.results);
  



  return (
    <div className="officer-details-container">
      {expert.err && (
        <Alert variant="danger" className="p-2">
          {expert.err}
        </Alert>
      )}
      {expert.success && (
        <Alert variant="success" className="p-2">
          {expert.success}
        </Alert>
      )}

      {/* Full-width officer details */}
      <div className="officer-details-section">
        <h1>{expert.results._name}</h1>

        {/* Table for officer details */}
        <div className="table-responsive">
          <table className="officer-details-table">
            <tbody>
              <tr>
                <td><strong>الرقم القومي:</strong></td>
                <td>{expert.results._nationalID}</td>
              </tr>

              <tr>
                <td><strong>الاسم:</strong></td>
                <td>{expert.results._name}</td>
              </tr>
              <tr>
                <td><strong>رقم جواز السفر:</strong></td>
                <td>{expert.results._passport_number}</td>
              </tr>

              <tr>
                <td><strong>رقم التصديق الأمني:</strong></td>
                <td>{expert.results._security_clearance_number}</td>
              </tr>

              <tr>
                <td><strong>الفترة من:</strong></td>
                <td>{moment(expert.results._valid_from).format('YYYY-MM-DD')}</td>
              </tr>

              <tr>
                <td><strong>الفترة إلى:</strong></td>
                <td>{moment(expert.results._valid_through).format('YYYY-MM-DD')}</td>
              </tr>

              <tr>
                <td><strong>الفرع / الورشة:</strong></td>
                <td>{expert.results._department}</td>
              </tr>

              <tr>
                <td><strong>اسم الشركة:</strong></td>
                <td>{expert.results._company_name}</td>
              </tr>

              

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpertDetails;