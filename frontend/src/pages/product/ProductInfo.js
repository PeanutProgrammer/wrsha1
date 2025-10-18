import React, { useState, useEffect } from 'react';
import '../Requests/Requests.css';
import { Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { getAuthUser } from '../../helper/Storage';

const ProductInfo = () => {
  const auth = getAuthUser();
  let { id } = useParams();
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:4001/Appointments/${id}`, {
      headers: {
        token: auth.token,
      },
    })
      .then((response) => {
        setAppointments(response.data);
      })
      .catch((error) => {
        console.log(error);
        // show error message
      });
  }, []);

  const sendRequest = (code) => {
    axios.post(`http://localhost:4001/requests/${code}`, {}, {
      headers: {
        token: auth.token,
      },
    })
      .then((response) => {
        setRequests({ ...requests, [code]: true });
        setSuccess(true);
        setError("");
      })
      .catch((err) => {
        setError(
          err.response
            ? JSON.stringify(err.response.data.errors)
            : "Something went wrong. Please try again later."
        );
        console.log(JSON.stringify(err.response.data.errors));
      });
  };

  return (
    <div className="Requests p-5">
      <div className=" mb-5">
        <h3 className="text-center mb-3">REQUEST APPOINTMENT</h3>
        {error && (
          <Alert variant="danger" className="p-2">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="p-2">
            Request sent successfully.
          </Alert>
        )}
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Code</th>
            <th>Source</th>
            <th>Destination</th>
            <th>Start Datetime</th>
            <th>End Datetime</th>
            <th>Bus Code</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.code}</td>
              <td>{appointment.source}</td>
              <td>{appointment.destination}</td>
              <td>{appointment.start_datetime}</td>
              <td>{appointment.end_datetime}</td>
              <td>{appointment.bus}</td>
              <td>{appointment.price}</td>
              <td>
                {requests[appointment.code] ? (
                  <span className="text-success font-weight-bold">Requested</span>
                ) : (
                  <button
                    className="btn btn-sm btn-primary mx-1 p-2"
                    onClick={() => sendRequest(appointment.code)}
                  >
                    Request
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
    

  )
}

export default ProductInfo;
    
