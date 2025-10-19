import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './Soldier.css';
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
    <div className="officer p-5">
      
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

<div className="table-responsive">
      <Table striped bordered hover>
              <thead>
                <tr>
                  <th>الرقم العسكري</th>
                  <th>الدرجة</th>
                  <th>الإسم</th>
                  <th>الورشة / الفرع</th>
                  <th>تاريخ الضم</th>
                  <th>تاريخ التسريح</th>
                  <th>التمام</th>
                  
                </tr>
              </thead>
              <tbody>
               <tr>
                  <td>{soldier.results._mil_id}</td>
                  <td>{soldier.results._rank}</td>
                  <td>{soldier.results._name}</td>
                  <td>{soldier.results._department}</td>
                  <td>{moment(soldier.results._join_date).format("yyyy-MM-DD")}</td>
                  <td>{moment(soldier.results._end_date).format("yyyy-MM-DD")}</td>

                  <td>{soldier.results._in_unit ? "متواجد" : "غير موجود"}</td>
                </tr>
              </tbody>
            </Table>
            </div>
    </div>
  );
};

export default SoldierDetails;