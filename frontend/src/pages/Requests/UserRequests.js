import React, { useState, useEffect } from 'react';
import './Requests.css';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getAuthUser } from '../../helper/Storage';

const UserRequests = () => {
    const auth = getAuthUser()
  const [requests, setRequests] = useState([]);

  useEffect(() => {
      axios.get('http://localhost:4001/Requests/all/' + auth.id, {
          headers: {
        token: auth.token
    }})
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.log(error);
        // show error message
      });
  }, []);





  return (
    <div className="Requests p-5">
      <div className=" mb-5">
        <h3 className="text-center mb-3">YOUR REQUESTS</h3>
      </div>
      {requests.err && (
        <Alert variant="danger" className="p-2">
          {requests.err}
        </Alert>
      )}
      {requests.success && (
        <Alert variant="success" className="p-2">
          {requests.success}
        </Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Code</th>
            <th>Requested Appointment (Code)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.code}</td>
              <td>{request.appointment_code}</td>
              <td>
                {request.status === 0 && (
                  <>
                <span className="text-warning font-weight-bold">Pending</span>


                  </>
                )}
                {request.status === 1 && (
                  <span className="text-success font-weight-bold">Accepted</span>
                )}
                {request.status === 2 && (
                  <span className="text-danger font-weight-bold">Declined</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default UserRequests;