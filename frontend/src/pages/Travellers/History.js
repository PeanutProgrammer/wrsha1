import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const RequestHistory = () => {
  const auth = getAuthUser()
    let {id} = useParams();


  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    useEffect(() => {
      console.log(id);
    axios
      .get('http://localhost:4001/Requests/all/' + id, {
        headers: {
        token: auth.token
      }})
      .then((response) => {
        setHistoryData(response.data);
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        setHistoryData([]);
        setLoading(false);
        setError(error.response.data.errors);
      });
  }, []);

  return (
    <div className="p-4 col-10">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">REQUEST HISTORY</h3>
        </div>
      {loading && <p>Loading history data...</p>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && (
        
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Code</th>
              <th>UserEmail</th>
              <th>Requested Appointment (Code)</th>
              <th>Status</th>          
              
            </tr>
          </thead>
          <tbody>
            {historyData.map((data) => (
              <tr key={data.id}>
                <td>{data.code}</td>
                <td>{data.user_email}</td>
                <td>{data.appointment_code}</td>
                <td>
                {data.status === 0 && (
                  <>
                <span className="text-warning font-weight-bold">Pending</span>


                  </>
                )}
                {data.status === 1 && (
                  <span className="text-success font-weight-bold">Accepted</span>
                )}
                {data.status === 2 && (
                  <span className="text-danger font-weight-bold">Declined</span>
                )}
              </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default RequestHistory;