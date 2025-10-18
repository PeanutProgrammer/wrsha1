import React, { useState, useEffect } from 'react';
import { Table, Alert } from 'react-bootstrap';
import './Appointements.css';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { getAuthUser } from '../../helper/Storage';

const AppointmentsPage = () => {
  const auth = getAuthUser()
  let { id } = useParams();
  const [appointments, setAppointments] = useState({
    loading: true,
    err: null,
    results: [],
    reload: 0,
  });

  useEffect(() => {
    setAppointments({ ...appointments, loading: true });
    
    axios.get('http://localhost:4001/Appointments/all',  {
      headers: {
        token: auth.token
      }
    })
      .then(resp => {
        setAppointments({
          ...appointments,
          results: resp.data,
          loading: false,
          err: null
        }); 
      })
      .catch(err => {
        setAppointments({
          ...appointments,
          loading: false,
          err: err.response ? JSON.stringify(err.response.data.errors) : "Something went wrong. Please try again later."
        });
      }); 
  }, [appointments.reload]);

  const deleteAppointment = (id) => {
    console.log(appointments.results);
    axios
      .delete(`http://localhost:4001/Appointments/${id}`,  {
        headers: {
          token: auth.token
        }
      })
      .then((resp) => {
        setAppointments((prevAppointments) => ({
          ...prevAppointments,
          reload: prevAppointments.reload + 1,
        }));
      })
      .catch((err) => {
        setAppointments({
          ...appointments,
          err: "something error",
        });
      });
  };

  return (
    <div className="bus p-5">
      <div className="header d-flex justify-content-between mb-3">
        <h3 className="text-center mb-3">MANAGE APPOINTMENT</h3>
        <Link to={"AddAppointments"} className="btn btn-success mb-4"> Create New Appointment +</Link>
      </div>
      {appointments.err && (
        <Alert variant="danger" className="p-2">
          {appointments.err}
        </Alert>
      )}
      {appointments.success && (
        <Alert variant="success" className="p-2">
          {appointments.success}
        </Alert>
      )}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Codes</th>
            <th>From</th>
            <th>To</th>
            <th>Start DateTime</th>
            <th>End DateTime</th>
            <th>Bus Code</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {appointments.results && appointments.results.map((appointment) => (
            <tr key={appointment.id}>
              <td>{appointment.code}</td>
              <td>{appointment.source}</td>
              <td>{appointment.destination}</td>
              <td>{appointment.start_datetime}</td>
              <td>{appointment.end_datetime}</td>
              <td>{appointment.bus}</td>
              <td>{appointment.price}</td>
              <td>
                <button className="btn btn-sm btn-danger mx-1 p-2" onClick={(e) => { deleteAppointment(appointment.id) }}>Delete</button>
                <Link to={`${appointment.id}`} className="btn btn-sm btn-primary mx-1 p-2">Update</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AppointmentsPage;
