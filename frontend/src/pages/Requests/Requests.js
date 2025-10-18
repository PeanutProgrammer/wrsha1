import React, { useState, useEffect } from 'react';
import './Requests.css';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const Requests = () => {
  const auth = getAuthUser()
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:4001/Requests/pending', {
      headers: {
        token: auth.token
      }
    })
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.log(error);
        // show error message
      });
  }, []);

  const handleAccept = (id) => {
    axios.put(`http://localhost:4001/requests/accept/${id}`, { status: 'Accepted' }, { headers: { token: auth.token}})
      .then(response => {
        const updatedRequests = requests.map((request) => {
          if (request.id === id) {
            return { ...request, status: 'Accepted' };
          } else {
            return request;
          }
        });
        setRequests(updatedRequests);
        // show success message
      })
      .catch(error => {
        console.log(error);
        // show error message
      });
  };

  const handleDecline = (id) => {
    axios.put(`http://localhost:4001/requests/decline/${id}`, { status: 'Declined' }, {headers: {token: auth.token}})
      .then(response => {
        const updatedRequests = requests.map((request) => {
          if (request.id === id) {
            return { ...request, status: 'Declined' };
          } else {
            return request;
          }
        });
        setRequests(updatedRequests);
        // show success message
      })
      .catch(error => {
        console.log(error);
        // show error message
      });
  };

  return (
    <div className="Requests p-5">
      <div className=" mb-5">
        <h3 className="text-center mb-3">MANAGE REQUESTS</h3>
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
            <th>UserEmail</th>
            <th>Requested Appointment (Code)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td>{request.code}</td>
              <td>{request.user_email}</td>
              <td>{request.appointment_code}</td>
              <td>
                {request.status === 0 && (
                  <>
                    <button
                      className="btn btn-sm btn-primary mx-1 p-2"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-sm btn-danger mx-1 p-2"
                      onClick={() => handleDecline(request.id)}
                    >
                      Decline
                    </button>
                  </>
                )}
                {request.status === 'Accepted' && (
                  <span className="text-success font-weight-bold">Accepted</span>
                )}
                {request.status === 'Declined' && (
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

export default Requests;