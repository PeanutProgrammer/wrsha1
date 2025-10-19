import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './NCO.css';
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
      axios.get('http://localhost:4001/nco/' + id, {
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
    <div className="officer p-5">
      
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

<div className="table-responsive">
      <Table striped bordered hover>
              <thead>
                <tr>
                  <th>الرقم العسكري</th>
                  <th>الدرجة</th>
                  <th>الإسم</th>
                  <th>الورشة / الفرع</th>
                  <th>تاريخ الضم</th>
                  <th>التمام</th>
                  
                </tr>
              </thead>
              <tbody>
               <tr>
                  <td>{nco.results._mil_id}</td>
                  <td>{nco.results._rank}</td>
                  <td>{nco.results._name}</td>
                  <td>{nco.results._department}</td>
                  <td>{moment(nco.results._join_date).format("yyyy-MM-DD")}</td>
                  <td>{nco.results._in_unit ? "متواجد" : "غير موجود"}</td>
                </tr>
              </tbody>
            </Table>
            </div>
    </div>
  );
};

export default NCODetails;