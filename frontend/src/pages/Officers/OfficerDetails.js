import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './Officers.css';
import { Link , useParams} from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';
import moment from "moment"

const OfficerDetails = () => {
    const auth = getAuthUser()
  let {id} = useParams();
  const [officer, setOfficers] = useState({
    loading : true ,
    err : null , 
    results : [] ,
    reload : 0 ,
  });

  useEffect(() => {
    setOfficers({ ...officer,loading : true});
      axios.get('http://localhost:4001/Officer/' + id, {
          headers: {
        token: auth.token
    }})
      .then(resp => {
        setOfficers({...officer, results : resp.data , loading : false , err:null });
      })
      .catch(err => {
        setOfficers({
          ...officer,
            loading : false , 
            err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later." ,
          });

      }); 
  }, [officer.reload]);



  return (
    <div className="officer p-5">
      
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

<div className="table-responsive">
      <Table striped bordered hover>
              <thead>
                <tr>
                  <th>الرقم العسكري</th>
                  <th>الرتبة</th>
                  <th>الإسم</th>
                  <th>الورشة / الفرع</th>
                  <th>تاريخ الضم</th>
                  <th>التمام</th>
                  
                </tr>
              </thead>
              <tbody>
               <tr>
                  <td>{officer.results._mil_id}</td>
                  <td>{officer.results._rank}</td>
                  <td>{officer.results._name}</td>
                  <td>{officer.results._department}</td>
                  <td>{moment(officer.results._join_date).format("yyyy-MM-DD")}</td>
                  <td>{officer.results._in_unit ? "متواجد" : "غير موجود"}</td>
                </tr>
              </tbody>
            </Table>
            </div>
    </div>
  );
};

export default OfficerDetails;